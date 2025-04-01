import React, { useEffect, useState, useRef } from 'react';
import socket from './socket';
import AnnouncementBar from './components/AnnouncementBar';
import CardDeck from './components/CardDeck';
import PlayerView from './components/PlayerView';
import GameControls from './components/GameControls';

const App = () => {
  const [players, setPlayers] = useState([]);
  const [deckSize, setDeckSize] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const addAnnouncement = (msg) => {
    setAnnouncements(prev => [msg, ...prev].slice(0, 3));
  };
  const [isFull, setIsFull] = useState(false);
  const hasJoinedRef = useRef(false);

  const getSelfPlayer = () => players.find((p) => 'hand' in p);

  useEffect(() => {
    console.log("🚀 useEffect triggered");

    if (!socket.connected) {
      console.log("🔌 Calling socket.connect()...");
      socket.connect();
    } else {
      console.log(`🆔 Already connected. Socket ID: ${socket.id}`);
    }

    socket.on("connect", () => {
      console.log(`✅ Connected! Socket ID: ${socket.id}`);
      if (!hasJoinedRef.current) {
        console.log(`📡 Emitting joinGame... (socket.id: ${socket.id})`);
        socket.emit('joinGame');
        hasJoinedRef.current = true;
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn(`⚠️ Disconnected: ${reason}`);
    });

    socket.on("gameFull", () => {
      console.warn("🚫 Game is full. You cannot join.");
      setIsFull(true);
    });

    socket.on('gameLoaded', (data) => {
      console.log("📩 gameLoaded received", data);
      console.log('✅ players in gameLoaded:', data.players);
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
      setWinner(data.winner || null);
      addAnnouncement(`現在のターン: ${data.players[data.currentTurn]?.name || '不明'}`);
      const currentPlayer = players.find(p => p.seatIndex === currentTurn);
      if (currentPlayer?.name) addAnnouncement(`現在のターン: ${currentPlayer.name}`);
    });

    socket.on('playerLeft', ({ playerId }) => {
      console.log(`📢 Player ${playerId} left.`);
      addAnnouncement(`プレイヤーが退出しました (${playerId})`);
    });

    socket.on('cardDrawnNotice', ({ seatIndex }) => {
      console.log(`カードを引いたプレイヤー: seatIndex=${seatIndex}`);
      const next = players.find(p => p.seatIndex === currentTurn);
      addAnnouncement(`次のターン: ${next?.name || '不明'}`);
      const currentPlayer = players.find(p => p.seatIndex === currentTurn);
      if (currentPlayer?.name) addAnnouncement(`現在のターン: ${currentPlayer.name}`);
    });

    socket.on('cardDrawn', (data) => {
      console.log("🎴 cardDrawn received", data);
      console.log('✅ players in cardDrawn:', data.players);
      setPlayers(data.players);
      setDeckSize(data.deckSize);
      setCurrentTurn(data.nextTurn);
      setIsGameOver(data.isGameOver);
      setWinner(data.winner);
      addAnnouncement(
        data.winner ? `${data.winner} が勝利しました！` : `次のターン: ${data.players[data.nextTurn]?.name || '不明'}`
      );
      const currentPlayer = players.find(p => p.seatIndex === currentTurn);
      if (currentPlayer?.name) addAnnouncement(`現在のターン: ${currentPlayer.name}`);
    });

    socket.on('gameReset', (data) => {
      console.log("🔄 gameReset received", data);
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
      setWinner(null);
      addAnnouncement('ゲームがリセットされました。');
      const currentPlayer = players.find(p => p.seatIndex === currentTurn);
      if (currentPlayer?.name) addAnnouncement(`現在のターン: ${currentPlayer.name}`);
    });

    socket.on('error', ({ message }) => {
      console.error(`❌ Error received: ${message}`);
      addAnnouncement(`エラー: ${message}`);
    });

    return () => {
      console.log("🔄 Component unmounted or dependencies changed");
      socket.off("connect");
      socket.off("disconnect");
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
      console.log("🃏 Emitting drawCard...");
      socket.emit('drawCard');
    }
  };

  const selfPlayer = getSelfPlayer();
  const fixedMessage = selfPlayer ? `あなたは ${selfPlayer.name} です` : '';
  const isDrawable = getSelfPlayer()?.seatIndex === currentTurn;
  console.log('isDrawable:', isDrawable);

  const otherPlayers = players.filter((p) => !('hand' in p)).sort((a, b) => a.seatIndex - b.seatIndex);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AnnouncementBar fixedMessage={fixedMessage} messages={announcements} />

      {isFull ? (
        <div className="full-message">
          ⚠️ ゲームは満員です。他のプレイヤーが退出するのをお待ちください。
          <button onClick={() => window.location.reload()} className="retry-button">
            再試行
          </button>
        </div>
      ) : (
        <main className="flex flex-col flex-grow justify-between items-center">
          {otherPlayers.map((player) => (
            <div key={player.seatIndex} className="w-full flex justify-center my-4">
              <PlayerView
                playerName={player.name}
                cards={Array(player.handSize ?? 0).fill({ rank: '?', suit: 'back' })}
                isOpponent
              />
            </div>
          ))}

          <CardDeck drawCard={drawCard} isGameOver={isGameOver} isDrawable={isDrawable} />

          {selfPlayer && (
            <footer className="w-full">
              <PlayerView
                key={selfPlayer.seatIndex}
                playerName={selfPlayer.name || 'あなた'}
                cards={selfPlayer.hand}
              />
            </footer>
          )}
        </main>
      )}

      <GameControls resetGame={() => socket.emit('resetGame')} />
    </div>
  );
};

export default App;