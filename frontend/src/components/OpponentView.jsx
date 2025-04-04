import React from 'react';

const OpponentView = ({ playerName, handSize = 0 }) => (
  <div className="text-center my-2 px-2">
    <div className="text-xs text-gray-700 font-medium mb-1">{playerName}の手札: {handSize}枚</div>
    <div className="flex justify-center space-x-1 relative">
      {Array.from({ length: handSize }).map((_, i) => (
        <svg
          key={i}
          className="w-8 h-12 shadow-sm"
          viewBox="0 0 100 140"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`backGradient-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect width="100" height="140" rx="12" fill={`url(#backGradient-${i})`} stroke="#1e3a8a" strokeWidth="1.5" />
        </svg>
      ))}
    </div>
  </div>
);

export default OpponentView;