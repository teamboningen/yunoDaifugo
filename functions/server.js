import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Game from './game.js';
import firestore from './firebase.js';

const app = express();

// ゲーム状態をプレイヤーごとに整形するユーティリティ
function formatGameStateForPlayer(gameState, socketId) {
  return {
    ...gameState,
    players: gameState.players.map(player => {
      if (player.id === socketId) {
        return {
          name: player.name,
          seatIndex: player.seatIndex,
          hand: player.cards
        };
      } else {
        return {
          name: player.name,
          seatIndex: player.seatIndex,
          handSize: player.cards.length
        };
      }
    })
  };
}

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const GAME_DOC_ID = 'currentGame';

async function loadGameFromFirestore() {
  try {
    console.log("📌 Firestore: Loading game state...");
    const gameDoc = await firestore.collection('games').doc(GAME_DOC_ID).get();
    if (!gameDoc.exists) {
      console.log("⚠️ Firestore: No existing game found.");
      return null;
    }
    console.log("✅ Firestore: Game state loaded successfully.");
    return gameDoc.data();
  } catch (error) {
    console.error("❌ Firestore Error: Failed to load game:", error);
    return null;
  }
}

async function saveGameToFirestore(gameState) {
  try {
    console.log("📌 Firestore: Saving game state...");
    await firestore.collection('games').doc(GAME_DOC_ID).set(gameState);
    console.log("✅ Firestore: Game state saved successfully.");
  } catch (error) {
    console.error("❌ Firestore Error: Failed to save game:", error);
  }
}

async function initializeGameIfNeeded() {
  console.log("🔄 Checking Firestore for existing game...");
  let gameState = await loadGameFromFirestore();

  if (!gameState) {
    console.log("⚠️ No existing game found in Firestore.");
    console.log("🆕 Creating a new game...");
    const newGame = new Game();
    newGame.initialize();
    gameState = newGame.toJSON();
    await saveGameToFirestore(gameState);
    console.log("✅ Game initialized and saved.");
  } else {
    console.log("✅ Existing game found. No need to initialize.");
  }
}

initializeGameIfNeeded();

io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  socket.on('joinGame', async () => {
    console.log(`📥 joinGame request from: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    if (game.players.length >= 2) {
      socket.emit('gameFull');
      return;
    }

    const newPlayer = game.addPlayer(socket.id);
    if (!newPlayer) {
      socket.emit('error', { message: '参加できませんでした。' });
      return;
    }

    const gameState = game.toJSON();
    await saveGameToFirestore(gameState);

    game.players.forEach(player => {
      io.to(player.id).emit('gameLoaded', formatGameStateForPlayer(gameState, player.id));
    });
  });

  socket.on('drawCard', async () => {
    console.log(`🎴 drawCard received from: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerIndex = game.players.findIndex((player) => player.id === socket.id);
    if (playerIndex === -1) {
      console.error("❌ Player not found:", socket.id);
      socket.emit('error', { message: 'プレイヤーが見つかりません。' });
      return;
    }

    console.log(`🎴 Player ${socket.id} is drawing a card...`);
    const result = game.drawCard(playerIndex);

    if (result) {
      console.log("✅ Card drawn successfully.");
      const gameState = game.toJSON();
      await saveGameToFirestore(gameState);

      const drawer = game.players[playerIndex];
      const nextPlayer = game.players[game.currentTurn];
      const announcements = [
        `${drawer.name} がカードを引きました`,
        `${nextPlayer.name} のターンです`
      ];

      io.emit('cardDrawnNotice', { seatIndex: playerIndex });

      game.players.forEach(player => {
        io.to(player.id).emit('gameUpdated', {
          ...formatGameStateForPlayer(gameState, player.id),
          announcements
        });
      });
    } else {
      console.error("❌ Card draw failed.");
      socket.emit('error', { message: 'カードが引けませんでした。' });
    }
  });

  socket.on('resetGame', async () => {
    console.log("🔄 resetGame received.");

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    game.reset();

    const gameState = game.toJSON();
    await saveGameToFirestore(gameState);

    const currentPlayer = game.players[game.currentTurn];
    const announcements = [
      'ゲームがリセットされました。',
      `${currentPlayer.name} のターンです`
    ];

    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdated', {
        ...formatGameStateForPlayer(gameState, player.id),
        announcements
      });
    });
  });

  socket.on('disconnect', async () => {
    console.log(`⚠️ Socket disconnected: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerIndex = game.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) return;

    const leavingPlayer = game.players[playerIndex];
    game.removePlayer(socket.id);

    const gameState = game.toJSON();
    await saveGameToFirestore(gameState);

    const announcements = [
      `${leavingPlayer.name} が退出しました`
    ];

    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdated', {
        ...formatGameStateForPlayer(gameState, player.id),
        announcements
      });
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});