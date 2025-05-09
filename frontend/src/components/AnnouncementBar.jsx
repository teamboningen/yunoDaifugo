import React, { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, User } from 'lucide-react'

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const AnnouncementBar = ({ fixedMessage, messages }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = 0 // 常に最上部を表示
    }
  }, [messages])

  return (
    <div className="flex flex-col gap-2">
      {/* 固定メッセージ（変わらず上部に表示） */}
      <Alert className="bg-white shadow text-gray-800 font-medium">
        <User className="h-4 w-4 mr-2" />
        <AlertDescription>{fixedMessage}</AlertDescription>
      </Alert>

      {/* アナウンス表示（縦スクロール、2.5件分、初期状態で最新が見える） */}
      <div
        ref={containerRef}
        className="h-[135px] overflow-y-auto scroll-smooth w-full max-w-[600px] px-1 py-1 rounded-md"
      >
        <ul className="flex flex-col gap-2 w-full">
          {messages.slice(-3).map((msg, index) => (
            <li key={index}>
              <Alert className="bg-white shadow-sm w-full">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <AlertDescription>{msg.message}</AlertDescription>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.time)}
                  </span>
                </div>
              </Alert>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AnnouncementBar