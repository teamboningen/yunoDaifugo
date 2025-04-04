import React from 'react';

const formatTime = (isoTime) => {
  const date = new Date(isoTime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AnnouncementBar = ({ fixedMessage, messages = [] }) => (
  <div className="bg-[#E5E7EB] p-3 w-full">
    <div className="flex items-center p-3 rounded-md bg-white shadow text-gray-800 font-medium mb-2">
      <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      {fixedMessage}
    </div>
    <ul className="space-y-2">
      {messages.map((msg, idx) => (
        <li key={idx} className="flex justify-between items-center text-sm text-gray-900 bg-white px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12h2V8H9v4zm0 4h2v-2H9v2zm1-16a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
            <span>{msg.message}</span>
          </div>
          <span className="text-xs text-gray-500">{formatTime(msg.time)}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default AnnouncementBar;