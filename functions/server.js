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

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // ✅ プレイヤー参加処理 (joinGame)
  socket.on('joinGame', async () => {
    console.log(`🎮 joinGame received from: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    let game = new Game();

    if (currentGameState) {
      console.log("♻️ Loading existing game state...");
      game.loadState(currentGameState);
    } else {
      console.log("🆕 Initializing new game...");
      game.initialize();
    }

    console.log("👥 Current players before joining:", game.players);

    let existingPlayer = game.players.find(p => p.id === socket.id);

    if (!existingPlayer) {
      // 切断フラグがついているプレイヤーがいる場合、再接続とみなす
      const disconnectedPlayer = game.players.find(p => p.disconnected === true);
      if (disconnectedPlayer) {
        console.log(`🔄 Reconnecting player: ${socket.id}`);
        disconnectedPlayer.id = socket.id; // ID を更新
        disconnectedPlayer.disconnected = false; // 切断フラグを解除
        existingPlayer = disconnectedPlayer;
      }
    }

    if (!existingPlayer) {
      if (game.players.length < 2) {
        console.log(`➕ Adding new player: ${socket.id}`);
        game.players.push({ id: socket.id, hand: [], disconnected: false });
      } else {
        console.log(`🚫 Game full. Rejecting player: ${socket.id}`);
        socket.emit('gameFull');
        return;
      }
    }

    console.log("👥 Updated players:", game.players);

    const updatedGameState = game.getState();
    console.log("📡 Sending gameLoaded event with state:", updatedGameState);

    await saveGameToFirestore(updatedGameState);
    socket.emit('gameLoaded', updatedGameState);
  });

  // ✅ カードドロー処理 (drawCard)
  socket.on('drawCard', async () => {
    console.log(`🎴 drawCard received from: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerIndex = game.players.findIndex((player) => player.id === socket.id);
    if (playerIndex === -1 || game.players[playerIndex].disconnected) {
      console.error("❌ Player not found or disconnected:", socket.id);
      socket.emit('error', { message: 'プレイヤーが見つからないか、切断中です。' });
      return;
    }

    console.log(`🎴 Player ${socket.id} is drawing a card...`);
    const result = game.drawCard(playerIndex);

    if (result) {
      console.log("✅ Card drawn successfully.");
      await saveGameToFirestore(game.toJSON());
      io.emit('cardDrawn', game.toJSON());
    } else {
      console.error("❌ Card draw failed.");
      socket.emit('error', { message: 'カードが引けませんでした。' });
    }
  });

  // ✅ ゲームリセット処理 (resetGame)
  socket.on('resetGame', async () => {
    console.log('🔄 Game reset requested by:', socket.id);

    const currentGameState = await loadGameFromFirestore();
    const game = new Game();

    if (currentGameState) {
      game.loadState(currentGameState);
    }

    console.log("🆕 Initializing new game state...");
    game.initialize();
    game.players.forEach(player => {
      player.id = player.id || null;
    });

    await saveGameToFirestore(game.toJSON());
    io.emit('gameReset', game.toJSON());
    console.log('✅ Game has been reset.');
  });

  // ✅ プレイヤー切断処理 (disconnect)
  socket.on('disconnect', async () => {
    console.log(`🔌 User disconnected: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerToUpdate = game.players.find((player) => player.id === socket.id);
    if (playerToUpdate) {
      playerToUpdate.disconnected = true;  // ❗ 切断フラグを設定
      console.log(`❌ Player flagged as disconnected: ${socket.id}`);
      await saveGameToFirestore(game.toJSON());
      io.emit('playerLeft', { playerId: socket.id });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});