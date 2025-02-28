import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AnnouncementBar from './components/AnnouncementBar';
import CardDeck from './components/CardDeck';
import PlayerView from './components/PlayerView';
import GameControls from './components/GameControls';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'https://sufficient-tiffani-teamboningen-58a55eb3.koyeb.app');

const App = () => {
  const [players, setPlayers] = useState([]);
  const [deckSize, setDeckSize] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [announcement, setAnnouncement] = useState('ゲームを開始します！');
  const [isFull, setIsFull] = useState(false); // 満員フラグ追加

  useEffect(() => {
    // 満員時の処理
    socket.on("gameFull", () => {
      console.warn("🚫 Game is full. You cannot join.");
      setIsFull(true);
    });

    // ゲーム参加リクエストを送信
    socket.emit('joinGame');

    // サーバーからゲーム状態を受信
    socket.on('gameLoaded', (data) => {
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
      setWinner(data.winner || null);
      setAnnouncement(`現在のターン: ${data.players[data.currentTurn]?.name || '不明'}`);
    });

    socket.on('playerLeft', ({ playerId }) => {
      setAnnouncement(`プレイヤーが退出しました (${playerId})`);
    });

    socket.on('cardDrawn', (data) => {
      setPlayers(data.players);
      setDeckSize(data.deckSize);
      setCurrentTurn(data.nextTurn);
      setIsGameOver(data.isGameOver);
      setWinner(data.winner);
      setAnnouncement(
        data.winner ? `${data.winner} が勝利しました！` : `次のターン: ${data.players[data.nextTurn]?.name || '不明'}`
      );
    });

    socket.on('gameReset', (data) => {
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
      setWinner(null);
      setAnnouncement('ゲームがリセットされました。');
    });

    socket.on('error', ({ message }) => {
      setAnnouncement(`エラー: ${message}`);
    });

    return () => {
      socket.off("gameFull");
      socket.off('gameLoaded');
      socket.off('playerLeft');
      socket.off('cardDrawn');
      socket.off('gameReset');
      socket.off('error');
    };
  }, []);

  const drawCard = () => {
    if (deckSize > 0 && !isGameOver) {
      socket.emit('drawCard');
    }
  };

  const playerHand = players[0]?.hand || [];
  const opponent = players[1];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AnnouncementBar message={announcement} />

      {isFull ? (
        // 満員時のメッセージ表示
        <div className="full-message">
          ⚠️ ゲームは満員です。他のプレイヤーが退出するのをお待ちください。
          <button onClick={() => window.location.reload()} className="retry-button">
            再試行
          </button>
        </div>
      ) : (
        <main className="flex flex-col flex-grow justify-between items-center">
          {opponent && (
            <div className="w-full flex justify-center my-4">
              <PlayerView
                playerName={opponent.name}
                cards={Array(opponent.hand.length).fill({ rank: '?', suit: 'back' })}
                isOpponent
              />
            </div>
          )}

          <CardDeck drawCard={drawCard} isGameOver={isGameOver} />

          <footer className="w-full">
            <PlayerView playerName={players[0]?.name || 'あなた'} cards={playerHand} />
          </footer>
        </main>
      )}

      <GameControls resetGame={() => socket.emit('resetGame')} />
    </div>
  );
};

export default App;