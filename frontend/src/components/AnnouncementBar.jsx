import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, User } from 'lucide-react'

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const AnnouncementBar = ({ fixedMessage, messages }) => {
  return (
    <div className="flex flex-col gap-2">
      <Alert className="bg-white shadow text-gray-800 font-medium">
        <User className="h-4 w-4 mr-2" />
        <AlertDescription>{fixedMessage}</AlertDescription>
      </Alert>
      <ul className="flex flex-col gap-2">
        {messages.slice(0, 3).map((msg, index) => (
          <li key={index}>
            <Alert className="bg-white shadow-sm">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-600" />
                  <AlertDescription>{msg.message}</AlertDescription>
                </div>
                <span className="text-xs text-gray-500">{formatTime(msg.time)}</span>
              </div>
            </Alert>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AnnouncementBar