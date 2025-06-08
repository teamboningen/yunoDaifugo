import React, { useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Bell } from 'lucide-react';

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};

const AnnouncementBar = ({ fixedMessage, messages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = 0; // 常に最上部を表示
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-1 sm:gap-2 p-1 sm:p-2 pt-[calc(env(safe-area-inset-top)+0.25rem)]">
      {/* 固定メッセージ（変わらず上部に表示） */}
      <Alert className="bg-white shadow text-gray-800 font-medium text-xs sm:text-sm py-1 sm:py-2">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <AlertDescription className="flex-1">{fixedMessage}</AlertDescription>
        </div>
      </Alert>

      {/* アナウンス表示（縦スクロール、2.5件分、初期状態で最新が見える） */}
      <div
        ref={containerRef}
        className="h-[60px] sm:h-[80px] md:h-[100px] overflow-y-auto scroll-smooth w-full max-w-full sm:max-w-[600px] px-1 py-1 rounded-md"
      >
        <ul className="flex flex-col gap-1 sm:gap-2 w-full">
          {messages.slice(-3).map((msg, index) => (
            <li key={index}>
              <Alert className="bg-white shadow-sm w-full py-1 sm:py-2">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                    <AlertDescription className="text-xs sm:text-sm">{msg.message}</AlertDescription>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {formatTime(msg.time)}
                  </span>
                </div>
              </Alert>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnnouncementBar;