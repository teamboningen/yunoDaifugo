
import React from 'react'
import { Card } from '@/components/ui/card'
import CardBackSVG from './CardBackSVG'

const OpponentView = ({ playerName, handSize = 0 }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-center items-center">
        <p className="text-white mb-1 text-sm">{playerName}の手札: {handSize}枚</p>
      </div>
      <div className="flex justify-center">
        <div className="relative w-16 h-24">
          {Array.from({ length: Math.max(0, handSize) }).map((_, index) => (
            <div
              key={index}
              className="absolute w-16 h-24"
              style={{
                transform: `translate(${index * 10}px, 0)`,
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
