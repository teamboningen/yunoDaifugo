import React from 'react';

const AnnouncementBar = ({ fixedMessage, messages }) => (
  <div className="bg-yellow-100 text-gray-800 text-sm py-2 px-4 space-y-1">
    <div className="font-semibold">{fixedMessage}</div>
    {messages.map((msg, idx) => (
      <div key={idx}>{msg}</div>
    ))}
  </div>
);

export default AnnouncementBar;