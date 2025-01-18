import React from 'react';

const GameControls = ({ resetGame }) => {
  return (
    <div className="text-center mt-6">
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        onClick={resetGame}
      >
        Reset Game
      </button>
    </div>
  );
};

export default GameControls;