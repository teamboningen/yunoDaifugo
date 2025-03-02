import React from 'react';
import cardBackImage from '../assets/card-back.jpeg';

const CardDeck = ({ drawCard, isGameOver }) => {
  return (
    <div className="flex justify-center items-center my-4">
      <button onClick={drawCard} disabled={isGameOver} className="focus:outline-none">
        <img
          src={cardBackImage}
          alt="Deck"
          className="w-24 h-32 object-cover rounded shadow-lg hover:scale-105 transition-transform"
        />
      </button>
    </div>
  );
};

export default CardDeck;