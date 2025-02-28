import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const suits = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const PlayerView = ({ playerName, cards, isOpponent = false }) => {
  const [selectedCards, setSelectedCards] = useState([]);

  const toggleCardSelection = (index) => {
    if (!isOpponent) {
      setSelectedCards((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2 text-center">{playerName}</h2>
      <ScrollArea className="w-full">
        <div className="flex space-x-2 justify-center">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => toggleCardSelection(index)}
              className={`w-16 h-24 flex justify-center items-center rounded-lg border cursor-pointer select-none transition-transform 
                ${selectedCards.includes(index) ? 'border-blue-500 scale-105' : 'border-gray-300'}
                ${isOpponent ? 'bg-gray-300 cursor-default' : 'bg-white'}`}
            >
              {!isOpponent && (
                <span className={`text-xl font-bold ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-black'}`}>
                  {suits[card.suit]} {card.rank}
                </span>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlayerView;