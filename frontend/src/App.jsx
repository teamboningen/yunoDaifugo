import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PlayerView from './components/PlayerView.jsx';
import CardDeck from './components/CardDeck.jsx';
import GameControls from './components/GameControls.jsx';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');

const App = () => {
  const [players, setPlayers] = useState([]);
  const [deckSize, setDeckSize] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    socket.emit('loadGame');

    socket.on('gameLoaded', (data) => {
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
    });

    socket.on('cardDrawn', (data) => {
      setPlayers(data.players);
      setDeckSize(data.deckSize);
      setCurrentTurn(data.nextTurn);
      setIsGameOver(data.isGameOver);
    });

    socket.on('gameReset', (data) => {
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
    });

    return () => {
      socket.off('gameLoaded');
      socket.off('cardDrawn');
      socket.off('gameReset');
    };
  }, []);

  const drawCard = () => {
    if (!isGameOver) {
      socket.emit('drawCard', { playerIndex: currentTurn });
    }
  };

  const resetGame = () => {
    socket.emit('resetGame');
  };

  return (
    <div className="App p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Card Game</h1>

      <div className="text-center text-blue-600 mb-4">
        {isGameOver ? (
          <strong className="text-red-600">Game Over! Click Reset to play again.</strong>
        ) : (
          <span>Current Turn: <strong>{players[currentTurn]?.name}</strong></span>
        )}
      </div>

      <CardDeck deckSize={deckSize} drawCard={drawCard} isGameOver={isGameOver} />

      <div className="grid grid-cols-2 gap-4 mt-6">
        {players.map((player, index) => (
          <PlayerView
            key={index}
            playerName={player.name}
            cards={player.cards}
            score={player.score}
          />
        ))}
      </div>

      <GameControls resetGame={resetGame} />
    </div>
  );
};

export default App;