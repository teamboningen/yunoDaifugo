import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Game from './game.js';
import firestore from './firebase.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const GAME_DOC_ID = 'currentGame';

async function loadGameFromFirestore() {
  const gameDoc = await firestore.collection('games').doc(GAME_DOC_ID).get();
  return gameDoc.exists ? gameDoc.data() : null;
}

async function saveGameToFirestore(gameState) {
  await firestore.collection('games').doc(GAME_DOC_ID).set(gameState);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ✅ プレイヤー参加処理 (joinGame)
  socket.on('joinGame', async () => {
    const currentGameState = await loadGameFromFirestore();
    let game = new Game();

    if (currentGameState) {
      game.loadState(currentGameState);
    } else {
      game.initialize();
    }

    const existingPlayer = game.players.find((player) => player.id === socket.id);
    const availableSlot = game.players.find((player) => !player.id);

    if (existingPlayer) {
      socket.emit('gameLoaded', game.toJSON()); // 既に参加済み
    } else if (availableSlot) {
      availableSlot.id = socket.id; // 空きスロットに割り当て
      console.log(`Player assigned: ${socket.id}`);
      await saveGameToFirestore(game.toJSON());
      io.emit('gameLoaded', game.toJSON());
    } else {
      console.log('Game is full');
      socket.emit('error', { message: 'すでに2人のプレイヤーが参加しています。' });
    }
  });

  // ✅ カードドロー処理 (drawCard)
  socket.on('drawCard', async () => {
    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerIndex = game.players.findIndex((player) => player.id === socket.id);
    if (playerIndex === -1) {
      socket.emit('error', { message: 'プレイヤーが見つかりません。' });
      return;
    }

    const result = game.drawCard(playerIndex);
    if (result) {
      await saveGameToFirestore(game.toJSON());
      io.emit('cardDrawn', game.toJSON());
    } else {
      socket.emit('error', { message: 'カードが引けませんでした。' });
    }
  });

  // ✅ ゲームリセット処理 (resetGame)
  socket.on('resetGame', async () => {
    console.log('Game reset requested by:', socket.id);

    const currentGameState = await loadGameFromFirestore();
    const game = new Game();

    if (currentGameState) {
      game.loadState(currentGameState);
    }

    game.initialize();
    game.players.forEach(player => {
      player.id = player.id || null; // 既存接続維持
    });

    await saveGameToFirestore(game.toJSON());
    io.emit('gameReset', game.toJSON());
    console.log('Game has been reset.');
  });

  // ✅ プレイヤー切断処理 (disconnect)
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerToRemove = game.players.find((player) => player.id === socket.id);
    if (playerToRemove) {
      playerToRemove.id = null; // 紐付け解除
      console.log(`Player removed: ${socket.id}`);
      await saveGameToFirestore(game.toJSON());
      io.emit('playerLeft', { playerId: socket.id });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
