import React from 'react'
import { Card } from '@/components/ui/card'
import CardBackSVG from './CardBackSVG'
import { cn } from '@/lib/utils'

const CardWrapper = ({ transform = '', isCenter = false, isDrawable }) => (
  <div className={cn("absolute w-16 h-24", transform)}>
    <Card
      className={cn(
        isCenter ? "w-16 h-24" : "w-full h-full",
        "p-0 overflow-hidden border-2",
        isDrawable ? "border-blue-300" : "border-gray-400",
        !isDrawable && "opacity-50"
      )}
    >
      <CardBackSVG />
    </Card>
  </div>
)

const CardDeck = ({ drawCard, isDrawable, isGameOver }) => {
  if (isGameOver) return null

  return (
    <div className="flex justify-center my-4">
      <button
        onClick={() => { if (isDrawable) { drawCard() } }}
        disabled={!isDrawable}
        className={cn(
          "relative mb-2 w-16 h-24",
          !isDrawable && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardWrapper transform="-translate-x-0.5 top-0 transform rotate-2" isDrawable={isDrawable} />
        <CardWrapper transform="translate-x-0.5 top-0 transform -rotate-2" isDrawable={isDrawable} />
        <CardWrapper transform="top-0" isCenter isDrawable={isDrawable} />
      </button>
    </div>
  )
}

export default CardDeck