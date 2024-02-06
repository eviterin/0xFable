import React, { useState } from 'react'
import { Deck, Card } from 'src/store/types' 
import Image from 'next/image' 

interface DeckConstructionPanelProps {
    deck: Deck
    selectedCards: Card[]
    onCardSelect: (card: Card) => void
    onSave: (deck: Deck) => void
    onCancel: () => void
  }
  
  
  const DeckConstructionPanel : React.FC<DeckConstructionPanelProps> = ({ deck, selectedCards = [], onCardSelect, onSave, onCancel }) => {
    const MAX_CARDS = 10//40
    const MIN_CARDS = 4//10

    const [ deckName, setDeckName ] = useState(deck.name)
    const [ isDeckNameValid, setIsDeckNameValid ] = useState(true)
    const [ isSaving, setIsSaving ] = useState(false)

    const handleDeckNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newName = event.target.value
      setDeckName(event.target.value)
      setIsDeckNameValid(nameValid(newName))
    }
  
    const nameValid = (name: string) => name.trim().length > 0

    const handleSave = () => {
      if (!nameValid(deckName)) {
        setIsDeckNameValid(false)
        return
      }
      setIsSaving(true)

      const newDeck = {
        name: deckName.trim(),
        cards: selectedCards
      }

      onSave(newDeck)
    }

  return (
    <div className="w-full flex flex-col items-center p-3">
      <div className="flex justify-between items-center">
        {/* Deck Name Input */}
        <input
          type="text"
          value={deckName}
          onChange={handleDeckNameChange}
          style={{ outline: isDeckNameValid ? "none" : "2px solid red" }}
          className="flex-grow px-2 py-2 border rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent m-1.5"
          placeholder=" Deck name"
        />
      
        {/* Save and Cancel Buttons */}
        <div className="flex justify-center">
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-l-md">
            {isSaving ? '⌛' : '✓'}
          </button>
          <button onClick={onCancel} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-r-md">
            ✕
          </button>
        </div>
      </div>

      {/* Counter Row */}
      <div className="w-full py-1">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
            <div style={{ width: `${(selectedCards.length / MAX_CARDS) * 100}%` }} 
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${selectedCards.length < MIN_CARDS ? 'bg-red-500' : selectedCards.length <= MAX_CARDS ? 'bg-green-500' : 'bg-yellow-500'}`}>
            </div>
          </div>
        </div>
        <div className="text-center text-sm font-medium">
          {selectedCards.length}/{MAX_CARDS}
        </div>
      </div>


      {/* List of Cards in the Deck */}
      <div className="mt-4 w-full">
        {/* Separator Line */}
        <div className="w-full border-t border-gray-200"></div>
        {selectedCards.map((card, index) => (
          <div 
            key={index} 
            className="p-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              if(!isSaving) onCardSelect(card)
            }}
          >
            <div className="flex items-center space-x-3">
              {/* todo @eviterin: get proper link to the card instead of always the witch */}
              <Image src="/card_art/0.jpg" alt ="Card art" width={40} height={40} className="object-cover rounded-full" />
              <span className="font-medium">{card.lore.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeckConstructionPanel