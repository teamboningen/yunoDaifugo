import React from 'react';
import { Button } from '@/components/ui/button';

const GameControls = ({ resetGame, isResetting }) => {
  return (
    <div className="p-2 flex justify-center">
      <div className="w-full max-w-xs">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-[env(safe-area-inset-bottom,0px)] chrome-safe-btn" 
          onClick={resetGame}
          disabled={isResetting}
          style={{
            paddingBottom: `calc(0.5em + env(safe-area-inset-bottom, 0px))`,
            marginBottom: `env(safe-area-inset-bottom, 0px)`
          }}
        >
          {isResetting ? "リセット中..." : "ゲームをリセット"}
        </Button>
      </div>
    </div>
  );
};

export default GameControls;