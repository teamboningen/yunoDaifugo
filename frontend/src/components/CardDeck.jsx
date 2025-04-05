import React from 'react'
import { Button } from '@/components/ui/button'

const CardDeck = ({ deckSize = 0, drawCard, isDrawable, isGameOver }) => {
  if (isGameOver) return null;

  return (
    <div className="my-4 flex justify-center">
      <Button onClick={isDrawable ? drawCard : undefined} disabled={!isDrawable} className="relative">
        {[...Array(Math.min(deckSize, 3))].map((_, i) => (
          <svg
            key={i}
            className="w-10 h-14 absolute"
            style={{ left: `${i * 6}px`, zIndex: i }}
            viewBox="0 0 100 140"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cardBackGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
            <rect width="100" height="140" rx="12" fill="url(#cardBackGradient)" stroke="#1e3a8a" strokeWidth="2" />
          </svg>
        ))}
      </Button>
    </div>
  );
};

export default CardDeck;