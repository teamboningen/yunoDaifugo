import React from 'react';

const PlayerView = ({ playerName, cards, score }) => {
  return (
    <div className="player-view border rounded p-4 shadow-md">
      <h2 className="text-xl font-semibold">{playerName}</h2>
      <div className="mt-2">
        <h3 className="text-lg font-medium">Cards:</h3>
        <ul className="list-disc list-inside">
          {cards.map((card, index) => (
            <li key={index}>
              {card.rank} of {card.suit}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-medium">Score:</h3>
        <p className="text-lg font-bold">{score}</p>
      </div>
    </div>
  );
};

export default PlayerView;