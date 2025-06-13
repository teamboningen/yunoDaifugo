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
    <div className="fixed bottom-0 left-0 right-0 bg-green-800/40 border-t border-green-200/50 rounded-t-lg mx-2 mb-2 p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <h2 className="text-lg font-semibold mb-2 text-white">{playerName}の手札: {cards.length}枚</h2>
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex space-x-2 pb-2 pr-4">
          {Array.isArray(cards) && cards.map((card, index) => {
            const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
            const suitSymbol = suitMap[card.suit] || card.suit;
            const displayRank = card.rank.charAt(0);
            const isNumberCard = !['Jack', 'Queen', 'King', 'Ace'].includes(card.rank);
            const suitCount = isNumberCard ? parseInt(card.rank, 10) : 1;
            
            return (
              <Card
                key={index}
                className="min-w-[50px] sm:min-w-[60px] md:min-w-[64px] h-20 sm:h-22 md:h-24 rounded-lg shadow-md border border-gray-400 bg-white flex flex-col justify-between px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm flex-shrink-0"
                style={{ color: isRed ? 'red' : 'black' }}
              >
                <div className="text-right">{displayRank}</div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {isNumberCard ? (
                    <div className="grid gap-0.5" style={{
                      gridTemplateColumns: suitCount <= 2 ? '1fr' : suitCount <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                      gridTemplateRows: suitCount <= 4 ? `repeat(${Math.ceil(suitCount / 2)}, 1fr)` : 'repeat(4, 1fr)'
                    }}>
                      {Array.from({ length: suitCount }).map((_, i) => (
                        <div key={i} className="text-center text-xs sm:text-sm">
                          {suitSymbol}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-xl sm:text-2xl md:text-3xl">{suitSymbol}</div>
                  )}
                </div>
                <div className="text-right rotate-180">{displayRank}</div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlayerView;