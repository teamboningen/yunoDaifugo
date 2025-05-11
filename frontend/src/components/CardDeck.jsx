import React, { useState } from 'react';
import { Card } from '@/components/ui/card'
import CardBackSVG from './CardBackSVG'
import { cn } from '@/lib/utils'

const CardWrapper = ({ transform = '', isCenter = false, isDrawable = false, isDrawing = false, showSuccess = false }) => (
  <div className={cn("absolute w-16 h-24", transform)}>
    <Card
      className={cn(
        isCenter ? "w-16 h-24" : "w-full h-full",
        "p-0 overflow-hidden border-2 transition-all duration-300",
        isDrawable ? "border-blue-300" : "border-gray-400",
        !isDrawable && "opacity-50",
        isDrawing && "animate-card-loading",
        showSuccess && "animate-card-success"
      )}
    >
      <CardBackSVG />
    </Card>
  </div>
)

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import CardBackSVG from './CardBackSVG';

const CardWrapper = ({ transform = '', isCenter = false, isDrawable = false, isDrawing = false, showSuccess = false }) => (
  <div className={cn("absolute w-full h-full", transform)}>
    <Card
      className={cn(
        isCenter ? "w-full h-full" : "w-full h-full",
        "p-0 overflow-hidden border-2 transition-all duration-300",
        isDrawable ? "border-blue-300" : "border-gray-400",
        !isDrawable && "opacity-50",
        isDrawing && "animate-card-loading",
        showSuccess && "animate-card-success"
      )}
    >
      <CardBackSVG />
    </Card>
  </div>
)

const CardDeck = ({ drawCard, isDrawable, isGameOver }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDrawCard = async () => {
    if (!isDrawable || isDrawing) return;
    setIsDrawing(true);

    try {
      await drawCard();
      const successTimeout = setTimeout(() => setShowSuccess(false), 500);
      setShowSuccess(true);
      return () => clearTimeout(successTimeout);
    } finally {
      const drawingTimeout = setTimeout(() => setIsDrawing(false), 500);
      return () => clearTimeout(drawingTimeout);
    }
  };

  if (isGameOver) return null;

  return (
    <div className="flex justify-center items-center my-2 md:my-4">
      <button
        onClick={handleDrawCard}
        disabled={!isDrawable || isDrawing}
        className={cn(
          "relative w-[60px] h-[90px] sm:w-16 sm:h-24 md:w-20 md:h-28",
          !isDrawable && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardWrapper transform="-translate-x-0.5 top-0 transform rotate-2" isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
        <CardWrapper transform="translate-x-0.5 top-0 transform -rotate-2" isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
        <CardWrapper transform="top-0" isCenter isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
      </button>
    </div>
  )
}

export default CardDeck