import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const AnnouncementBar = ({ fixedMessage, messages }) => {
  return (
    <div className="w-full px-4 py-2 space-y-1">
      {fixedMessage && (
        <Alert className="w-full bg-blue-50 border-blue-200 py-2 px-4 flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          <AlertDescription className="text-sm text-blue-800 font-semibold">
            {fixedMessage}
          </AlertDescription>
        </Alert>
      )}
      {messages.map((msg, index) => (
        <Alert
          key={index}
          className="w-full bg-gray-100 border-b border-gray-300 py-2 px-4 flex items-center"
        >
          <Info className="w-5 h-5 text-gray-600 mr-2" />
          <AlertDescription className="text-sm text-gray-700">
            {msg}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default AnnouncementBar;