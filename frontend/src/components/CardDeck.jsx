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
    <div className="flex flex-col justify-center items-center gap-2 sm:gap-4 p-1 sm:p-2 md:p-4">
      <div className="relative w-[70px] sm:w-[90px] md:w-[110px]">
        <button
          onClick={handleDrawCard}
          disabled={!isDrawable || isDrawing}
          className={cn(
            "relative w-[50px] h-[75px] sm:w-[60px] sm:h-[90px] md:w-[70px] md:h-[105px]",
            !isDrawable && "opacity-50 cursor-not-allowed"
          )}
        >
          <CardWrapper transform="-translate-x-0.5 top-0 transform rotate-2" isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
          <CardWrapper transform="translate-x-0.5 top-0 transform -rotate-2" isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
          <CardWrapper transform="top-0" isCenter isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
        </button>
      </div>
    </div>
  )
}

export default CardDeck