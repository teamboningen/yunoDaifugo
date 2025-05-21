import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import CardBackSVG from './CardBackSVG';

const CardWrapper = ({ transform = '', isCenter = false, isDrawable = false, isDrawing = false, showSuccess = false }) => (
  <div className={cn("absolute inset-0", transform)}>
    <Card
      className={cn(
        "w-full h-full",
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

const CardDeck = ({ drawCard, isGameOver, isDrawable }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isChromeDevice, setIsChromeDevice] = useState(false);

  useEffect(() => {
    // マウント時にChrome検出
    setIsChromeDevice(isChromeOnMobile());
  }, []);

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
    <div className={cn(
      "w-full max-w-xs p-2 mx-auto relative",
      isChromeDevice ? "chrome-safe-area" : ""
    )}>
      <div 
        className={cn(
          "h-[135px] w-[90px] mx-auto cursor-pointer relative transition-all duration-300",
          !isDrawable && !isGameOver && "opacity-50",
          isChromeDevice && "transform-gpu"
        )}
        onClick={isDrawable && !isGameOver ? handleDrawCard : undefined}
      >
        <CardWrapper transform="-translate-x-0.5 top-0 transform rotate-2" isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
        <CardWrapper transform="translate-x-0.5 top-0 transform -rotate-2" isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
        <CardWrapper transform="top-0" isCenter isDrawable={isDrawable} isDrawing={isDrawing} showSuccess={showSuccess} />
      </div>
    </div>
  )
}

export default CardDeck

function isChromeOnMobile() {
  const userAgent = navigator.userAgent;
  // Chrome for Android の userAgent を確認
  const isChrome = /Chrome/.test(userAgent) && /Android/.test(userAgent);t);
  return isChrome;
}