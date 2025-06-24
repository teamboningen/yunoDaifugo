
import React from 'react'
import { Card } from '@/components/ui/card'
import CardBackSVG from './CardBackSVG'

const OpponentView = ({ playerName, handSize = 0 }) => {
  return (
    <div className="mb-4 mx-[env(safe-area-inset-left)] mx-[env(safe-area-inset-right)]">
      <div className="flex justify-center items-center">
        <p className="text-white mb-1 text-sm">{playerName}の手札: {handSize}枚</p>
      </div>
      <div className="flex justify-center">
        <div className="relative w-10 sm:w-12 md:w-14 h-16 sm:h-18 md:h-20">
          {Array.from({ length: Math.max(0, handSize) }).map((_, index) => (
            <div
              key={index}
              className="absolute w-full h-full"
              style={{
                transform: `translate(${index * 8}px, 0)`,
                zIndex: handSize - index,
              }}
            >
              <Card className="w-full h-full p-0 overflow-hidden">
                <CardBackSVG />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OpponentView
