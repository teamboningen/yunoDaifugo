import React from 'react';

const PlayerView = ({ playerName, cards = [] }) => (
  <div className="text-center my-2 px-2">
    <div className="text-xs text-gray-700 font-medium mb-1">{playerName}の手札: {cards.length}枚</div>
    <div className="flex justify-start overflow-x-auto space-x-2 px-1">
      {cards.map((card, i) => {
        const isRed = card.suit === '♥' || card.suit === '♦';
        return (
          <div
            key={i}
            className="w-14 h-20 rounded-lg shadow-md border border-gray-400 bg-white flex flex-col justify-between px-1 py-1 text-xs"
            style={{ color: isRed ? 'red' : 'black' }}
          >
            <div className="text-left">{card.rank}</div>
            <div className="text-center text-lg">{card.suit}</div>
            <div className="text-right rotate-180">{card.rank}</div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PlayerView;