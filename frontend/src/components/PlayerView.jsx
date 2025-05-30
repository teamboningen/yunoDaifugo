import React from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const suitMap = {
  Hearts: '♥',
  Diamonds: '♦',
  Spades: '♠',
  Clubs: '♣',
};

const PlayerView = ({ cards = [], playerName }) => {
  return (
    <div className="my-4 px-4 mx-[env(safe-area-inset-left)] mx-[env(safe-area-inset-right)]">
      <h2 className="text-lg font-semibold mb-2">{playerName}の手札: {cards.length}枚</h2>
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex space-x-2 pb-2 pr-4">
          {Array.isArray(cards) && cards.map((card, index) => {
            const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
            const suitSymbol = suitMap[card.suit] || card.suit;
            return (
              <Card
                key={index}
                className="min-w-[50px] sm:min-w-[60px] md:min-w-[64px] h-20 sm:h-22 md:h-24 rounded-lg shadow-md border border-gray-400 bg-white flex flex-col justify-between px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm flex-shrink-0"
                style={{ color: isRed ? 'red' : 'black' }}
              >
                <div className="text-left">{card.rank}</div>
                <div className="text-center text-xl sm:text-2xl md:text-3xl">{suitSymbol}</div>
                <div className="text-right rotate-180">{card.rank}</div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlayerView;