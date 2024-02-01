import debounce from "lodash/debounce"
import Head from "next/head"

import { useState, useMemo, useEffect } from "react"
import { useAccount } from "wagmi"

import jotaiDebug from "src/components/lib/jotaiDebug"
import { Navbar } from "src/components/navbar"
import { deployment } from "src/deployment"
import { useInventoryCardsCollectionGetCollection } from "src/generated"
import { Deck, Card } from "src/store/types"
import { Address } from "src/chain"
import { FablePage } from "src/pages/_app"
import { useRouter } from 'next/router'
import { navigate } from "utils/navigate"

import FilterPanel from 'src/components/collection/filterPanel'
import CardCollectionDisplay from 'src/components/collection/cardCollectionDisplay'
import DeckList from 'src/components/collection/deckList'
import DeckPanel from 'src/components/collection/deckPanel'

import * as store from "src/store/hooks"
import { save, modify } from "src/actions/setDeck"
import { getAllDecks } from "src/actions/getDeck"

// NOTE(norswap & geniusgarlic): Just an example, when the game actually has effects & types,
//   fetch those from the chain instead of hardcoding them here.
type Effect = string
const effects: Effect[] = ['Charge', 'Flight', 'Courage', 'Undying', 'Frenzy', 'Enlightened']
const initialEffectMap = Object.assign({}, ...effects.map(name => ({[name]: false})))

const types = ['Creature', 'Magic', 'Weapon']
const initialTypeMap = Object.assign({}, ...types.map(name => ({[name]: false})))

const Collection: FablePage = ({ isHydrated }) => {
  const router = useRouter()
  const { address } = useAccount()
  const [ isEditing, setIsEditing ] = useState(false) 
  const [decks, setDecks] = useState<Deck[]>([])
  const playerAddress = store.usePlayerAddress()
  
  // Filter Panel / Sorting Panel
  const [ searchInput, setSearchInput ] = useState('')
  const [ effectMap, setEffectMap ] = useState(initialEffectMap)
  const [ typeMap, setTypeMap ] = useState(initialTypeMap)
  const [ selectedCard, setSelectedCard ] = useState<Card|null>(null)
  
  // Deck Collection Display
  const [ editingDeckIndex, setEditingDeckIndex ] = useState<number|null>(null)
  const [ isLoadingDecks, setIsLoadingDecks ] = useState(false) // Used to indicate that decks are being loaded from chain

  // Deck Construction Panel
  const [ currentDeck, setCurrentDeck] = useState<Deck|null>(null)
  const [ selectedCards, setSelectedCards ] = useState<Card[]>([]) 
  
  const activeEffects = Object.keys(effectMap).filter(key => effectMap[key])
  const activeTypes = Object.keys(typeMap).filter(key => typeMap[key])

  const { data: unfilteredCards } = useInventoryCardsCollectionGetCollection({
    address: deployment.InventoryCardsCollection,
    args: [address as Address] // TODO not ideal but safe in practice
  }) as {
    // make the wagmi type soup understandable, there are many more fields in reality
    data: readonly Card[],
  }

  const cards: Card[] = (unfilteredCards || []).filter(card => {
    // TODO(norswap): it would look like this if the card had effects & types
    // const cardEffects = card.stats.effects || []
    // const cardTypes = card.stats.types || []
    const cardEffects: Effect[] = []
    const cardTypes: Effect[] = []
    return activeEffects.every(effect => cardEffects.includes(effect))
      && activeTypes.every(type => cardTypes.includes(type))
      && card.lore.name.toLowerCase().includes(searchInput.toLowerCase())
  })

  const handleInputChangeBouncy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }
  const handleInputChange = useMemo(() => debounce(handleInputChangeBouncy, 300), [])

  const handleEffectClick = (effectIndex: number) => {
    const effect = effects[effectIndex]
    setEffectMap({...effectMap, [effect]: !effectMap[effect]})
  }

  const handleTypeClick = (typeIndex: number) => {
    const type = types[typeIndex]
    setTypeMap({...typeMap, [type]: !typeMap[type]})
  }

  // Called when an owned deck is selected to be viewed
  const handleDeckSelect = (deckID: number) => {
    const selectedDeck = decks[deckID]
    setCurrentDeck(selectedDeck)
    setEditingDeckIndex(deckID)
    setIsEditing(true)

    // Cards from chain are just BigInts. Now they need to be converted to actual cards.
    const cardObjects = selectedDeck.cards.map(idString => {
      const idBigInt = BigInt(idString); // Convert string to bigint
      return cards.find(card => card.id === idBigInt); // Find the card by ID
    })

    setSelectedCards(cardObjects)
  }

  const handleSaveDeck = (updatedDeck: Deck) => {
    const updatedDecks = [...decks]
    if (editingDeckIndex !== null) {
      // Update existing deck
      modifyOnchain(updatedDeck, editingDeckIndex)
      updatedDecks[editingDeckIndex] = updatedDeck
    } else {
      // Add the new deck to the list
      saveOnchain(updatedDeck)
      updatedDecks.push(updatedDeck)
    }
  
    setDecks(updatedDecks)
    setIsEditing(false)
    setSelectedCards([])
    navigate(router, '/collection')
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
    setSelectedCards([]) 
    navigate(router, '/collection')
  }

  const addToDeck = (card: Card) => {
    setSelectedCards(prevSelectedCards => {
      // Add or remove card from the selectedCards
      const isCardSelected = prevSelectedCards.some(selectedCard => selectedCard.id === card.id)
      if (isCardSelected) {
        return prevSelectedCards.filter(selectedCard => selectedCard.id !== card.id)
      } else {
        return [...prevSelectedCards, card]
      }
    })
  }

  function modifyOnchain(deck: Deck, index: number){
    modify({
      playerAddress: playerAddress!,
      index,
      deck,
      onSuccess: () => { 
      }
    })
  }

  function saveOnchain(deck: Deck){
    save({
      deck,
      playerAddress: playerAddress!,
      onSuccess: () => { 
      }
    })
  }

  const onCardToggle = (card: Card) => {
    setSelectedCards((prevSelectedCards) => {
        if (prevSelectedCards.some(selectedCard => selectedCard.id === card.id)) {
            // Remove the card if it's already selected
            return prevSelectedCards.filter(selectedCard => selectedCard.id !== card.id)
        } else {
            // Add the card if it's not already selected
            return [...prevSelectedCards, card]
        }
    })
  }

  // Sets up an event listener for route changes when deck editor is rendered.
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.query.newDeck) {
        setCurrentDeck({ name: '', cards: [] })
        setIsEditing(true)
        setEditingDeckIndex(null)
      }
    }
  
    router.events.on('routeChangeComplete', handleRouteChange)
  
    // Clean up the event listener when exiting the deck editor.
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, router.query.newDeck]) 



  useEffect(() => {

    if (playerAddress) {
      setIsLoadingDecks(true)
      getAllDecks({
        playerAddress: playerAddress,
        onSuccess: () => {
        },
      }).then(response => {

        const deckData = response.simulatedResult.map(deck => ({
          name: deck.name,
          cards: deck.cards.map(card => card.toString()) 
        }))

        setDecks(deckData);
      }).catch(error => {
        console.error("Error fetching decks:", error)
      }).finally(() => {
        setIsLoadingDecks(false)
      })
    }
  }, [playerAddress, setIsLoadingDecks])
  
  return (
    <>
      <Head>
        <title>0xFable: My Collection</title>
      </Head>
      {jotaiDebug()}
      <main className="flex h-screen flex-col">
        <Navbar />
        <div className="mx-6 mb-6 grid grow grid-cols-12 gap-4 min-h-0">
          {/* Left Panel - Search and Filters */}
          <div className="flex col-span-3 rounded-xl border overflow-y-auto">
            <FilterPanel
                effects={effects}
                types={types}
                effectMap={effectMap}
                typeMap={typeMap}
                handleEffectClick={handleEffectClick}
                handleTypeClick={handleTypeClick}
                handleInputChange={handleInputChange}
                selectedCard={selectedCard}
              />
          </div>

          {/* Middle Panel - Card Collection Display */}
          <div className="col-span-7 flex rounded-xl border overflow-y-auto">
            <CardCollectionDisplay
              cards={cards}
              isHydrated={isHydrated}
              setSelectedCard={setSelectedCard}
              onCardToggle={onCardToggle}
              selectedCards={selectedCards}
              isEditing={isEditing}
            />
          </div>

          {/* Right Panel - Deck List */}
          <div className="flex col-span-2 rounded-xl border overflow-y-auto">
            {isEditing && currentDeck ? (
              <DeckPanel
                deck={currentDeck}
                selectedCards={selectedCards}
                onCardSelect={addToDeck}
                onSave={handleSaveDeck}
                onCancel={handleCancelEditing} 
              />
            ) : (
              <DeckList 
                decks={decks} 
                onDeckSelect={handleDeckSelect}
                isLoadingDecks={isLoadingDecks}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default Collection