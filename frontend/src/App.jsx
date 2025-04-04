import React, { useEffect, useState, useRef } from 'react';
import socket from './socket';
import AnnouncementBar from './components/AnnouncementBar';
import CardDeck from './components/CardDeck';
import PlayerView from './components/PlayerView';
import OpponentView from './components/OpponentView';
import GameControls from './components/GameControls';

const App = () => {
  const [players, setPlayers] = useState([]);
  const [deckSize, setDeckSize] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isFull, setIsFull] = useState(false);
  const hasJoinedRef = useRef(false);

  const addAnnouncement = (msg) => {
    setAnnouncements(prev => [msg, ...prev].slice(0, 3));
  };

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
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
      setWinner(data.winner || null);
      addAnnouncement({ message: `現在のターン: ${data.players[data.currentTurn]?.name || '不明'}`, time: new Date().toISOString() });
    });

    socket.on('gameUpdated', (data) => {
      console.log('📩 gameUpdated received', data);
      setPlayers(data.players);
      setDeckSize(data.deck.length);
      setCurrentTurn(data.currentTurn);
      setIsGameOver(data.isGameOver);
      setWinner(data.winner || null);
      const self = data.players.find(p => p.id === socket.id);
      if (self?.hand) {
        setHand(self.hand);
      }
      if (Array.isArray(data.announcements)) {
        setAnnouncements(prev => [...data.announcements, ...prev].slice(0, 3));
      }
    });

    socket.on('error', ({ message }) => {
      console.error(`❌ Error received: ${message}`);
      addAnnouncement({ message: `エラー: ${message}`, time: new Date().toISOString() });
    });

    return () => {
      console.log("🔄 Component unmounted or dependencies changed");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameFull");
      socket.off('gameLoaded');
      socket.off('gameUpdated');
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
        <main className="flex flex-col flex-grow justify-between items-stretch w-full">
          {otherPlayers.map((player) => (
            <OpponentView
              key={player.seatIndex}
              playerName={player.name}
              handSize={player.handSize ?? 0}
            />
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