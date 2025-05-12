
import React from 'react';
import { Button } from '@/components/ui/button';

const GameControls = ({ resetGame }) => {
  return (
    <div className="text-center">
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
