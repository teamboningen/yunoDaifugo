import React from 'react';

function CardDeck({ deckSize, drawCard, isGameOver }) {
  return (
    <div className="text-center mb-6">
      <p className="text-lg">Deck Size: <strong>{deckSize}</strong></p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={drawCard}
        disabled={isGameOver || deckSize === 0}
      >
        Draw Card
      </button>
    </div>
  );
}

export default CardDeck;