
import React from 'react';
import { Button } from '@/components/ui/button';

const GameControls = ({ resetGame }) => {
  return (
    <div className="text-center pb-2 sm:pb-3 md:pb-4">
      <Button
        variant="outline"
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold"
        onClick={resetGame}
      >
        リセット
      </Button>
    </div>
  );
};

export default GameControls;
