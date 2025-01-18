import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PlayerView from './components/PlayerView';
import CardDeck from './components/CardDeck';
import GameControls from './components/GameControls';

// Socket.IOクライアントを初期化
const socket = io('http://localhost:3000'); // デプロイ時にはNetlifyのURLに変更

function App() {
  const [players, setPlayers] = useState([
    { name: 'Player 1', cards: [], score: 0 },
    { name: 'Player 2', cards: [], score: 0 },
  ]);
  const [currentTurn, setCurrentTurn] = useState(0); // 現在のターン (0: Player 1, 1: Player 2)
  const [deckSize, setDeckSize] = useState(52); // 残りのデッキ枚数
  const [isGameOver, setIsGameOver] = useState(false);

  // サーバーからのデータ受信
  useEffect(() => {
    socket.on('cardDrawn', ({ playerIndex, card, nextTurn, isGameOver, deckSize }) => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = [...prevPlayers];
        updatedPlayers[playerIndex].cards.push(card);
        updatedPlayers[playerIndex].score += card.value; // カードのスコアを追加
        return updatedPlayers;
      });
      setCurrentTurn(nextTurn);
      setIsGameOver(isGameOver);
      setDeckSize(deckSize);
    });

    socket.on('gameReset', () => {
      setPlayers([
        { name: 'Player 1', cards: [], score: 0 },
        { name: 'Player 2', cards: [], score: 0 },
      ]);
      setCurrentTurn(0);
      setDeckSize(52);
      setIsGameOver(false);
    });

    return () => {
      socket.off('cardDrawn');
      socket.off('gameReset');
    };
  }, []);

  // カードを引くアクション
  const drawCard = () => {
    if (!isGameOver) {
      socket.emit('drawCard', { playerIndex: currentTurn });
    }
  };

  // ゲームのリセット
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
          <span>Current Turn: <strong>{players[currentTurn].name}</strong></span>
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
}

export default App;