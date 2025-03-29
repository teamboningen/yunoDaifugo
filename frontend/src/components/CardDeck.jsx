import React from 'react';

const CardDeck = ({ drawCard, isGameOver, isDrawable }) => {
  const handleClick = () => {
    if (!isGameOver && isDrawable) {
      drawCard();
    }
  };

  return (
    <div className="my-6 cursor-pointer">
      <svg
        width="100"
        height="140"
        viewBox="0 0 100 140"
        onClick={handleClick}
        className={`transition-opacity duration-300 mx-auto drop-shadow-md ${
          isDrawable ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}
        style={{ cursor: isDrawable ? 'pointer' : 'default' }}
      >
        <rect width="100" height="140" rx="10" fill="#2d3748" stroke="#718096" strokeWidth="3" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#cbd5e0" fontSize="20">
          DECK
        </text>
      </svg>
    </div>
  );
};

export default CardDeck;