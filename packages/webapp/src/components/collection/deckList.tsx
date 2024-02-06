import React from 'react'
import Link from "src/components/link"
import { Deck } from 'src/store/types'

interface DeckCollectionDisplayProps {
  decks: Deck[]
  onDeckSelect: (deckID: number) => void
  isLoadingDecks: boolean
}

const DeckCollectionDisplay: React.FC<DeckCollectionDisplayProps> = ({ decks, onDeckSelect, isLoadingDecks }) => {
  return (
      <div className="w-full flex flex-col items-center p-3">
        {/* New Deck Button */}
        <Link 
          href={"/collection?newDeck=true"} 
          className="w-full px-4 py-2 mb-2 border rounded-md text-gray-100 bg-purple-900 hover:bg-gray-500 font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          New Deck →
        </Link>

        {/* Loading Decks Button */}
        {isLoadingDecks && (
          <button
            className="w-full px-4 py-2 mb-2 border rounded-md text-gray-100 bg-purple-500 font-bold text-center cursor-not-allowed"
            disabled
          >
            Loading Decks...
          </button>
        )}

        {/* Deck Buttons */}
        {decks.map((deck, deckID) => (
          <button 
            key={deckID} 
            onClick={() => onDeckSelect(deckID)}
            className={`w-full px-4 py-2 mb-2 border rounded-md text-gray-100 ${isLoadingDecks ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-gray-500'} font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            disabled={isLoadingDecks}
          >
            {deck.name}
          </button>
        ))}

      </div>
  )
}

export default DeckCollectionDisplay