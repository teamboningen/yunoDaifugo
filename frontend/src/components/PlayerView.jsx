import React from 'react'
import { Card } from '@/components/ui/card'

const suitMap = {
  Hearts: '♥',
  Diamonds: '♦',
  Spades: '♠',
  Clubs: '♣',
};

const PlayerView = ({ cards = [], playerName }) => {
  return (
    <div className="my-4 px-4">
      <h2 className="text-lg font-semibold mb-2">{playerName}の手札: {cards.length}枚</h2>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {cards.map((card, index) => {
          const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
          const suitSymbol = suitMap[card.suit] || card.suit;
          return (
            <Card
              key={index}
              className="min-w-[64px] h-24 rounded-lg shadow-md border border-gray-400 bg-white flex flex-col justify-between px-2 py-2 text-sm"
              style={{ color: isRed ? 'red' : 'black' }}
            >
              <div className="text-left">{card.rank}</div>
              <div className="text-center text-3xl">{suitSymbol}</div>
              <div className="text-right rotate-180">{card.rank}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerView;