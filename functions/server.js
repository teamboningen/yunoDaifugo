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
  console.log("📌 Checking Firestore for existing game...");
  let gameState = await loadGameFromFirestore();

  if (!gameState) {
    console.log("⚠️ No existing game found in Firestore.");
    console.log("🆕 Creating a new game...");
    const newGame = new Game();
    newGame.initialize();
    gameState = newGame.toJSON();

    await saveGameToFirestore(gameState);
    console.log("✅ New game initialized and saved to Firestore.");
  } else {
    console.log("✅ Existing game found in Firestore.");
  }
  return gameState;
}

// ✅ Express サーバー起動前の初期処理（ベストプラクティス）
async function main() {
  try {
    console.log("🔄 Initializing game state before starting the server...");
    await initializeGameIfNeeded();  // Firestore のデータを初期化
    console.log("🟢 Game initialization complete. Starting the server...");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);  // 失敗した場合はプロセスを終了
  }
}

// ✅ `main()` を呼び出して、初期化後にサーバーを起動
main();

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

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
      const emptySlot = game.players.find(p => p.id === null);
      if (emptySlot) {
        console.log(`🔄 Assigning socket.id ${socket.id} to empty player slot`);
        emptySlot.id = socket.id;
        existingPlayer = emptySlot;
      }
    }

    if (!existingPlayer) {
      console.log(`🚫 Game full. Rejecting player: ${socket.id}`);
      socket.emit('gameFull');
      return;
    }

    console.log("👥 Updated players:", game.players);

    const updatedGameState = game.toJSON();
    console.log("📡 Sending gameLoaded event with state:", updatedGameState);

    await saveGameToFirestore(updatedGameState);
    socket.emit('gameLoaded', updatedGameState);
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
      await saveGameToFirestore(game.toJSON());
      const gameState = game.toJSON();
      game.players.forEach(player => {
        io.to(player.id).emit('cardDrawn', formatGameStateForPlayer(gameState, player.id));
      });
    } else {
      console.error("❌ Card draw failed.");
      socket.emit('error', { message: 'カードが引けませんでした。' });
    }
  });

  socket.on('resetGame', async () => {
    console.log('🔄 Game reset requested by:', socket.id);

    const currentGameState = await loadGameFromFirestore();
    const game = new Game();

    if (currentGameState) {
      game.loadState(currentGameState);
    }

    console.log("🆕 Initializing new game state...");
    game.initialize();

    await saveGameToFirestore(game.toJSON());
    const gameState = game.toJSON();
    game.players.forEach(player => {
      io.to(player.id).emit('gameReset', formatGameStateForPlayer(gameState, player.id));
    });
    console.log('✅ Game has been reset.');
  });

  socket.on('disconnect', async () => {
    console.log(`🔌 User disconnected: ${socket.id}`);

    const currentGameState = await loadGameFromFirestore();
    if (!currentGameState) return;

    const game = new Game();
    game.loadState(currentGameState);

    const playerToUpdate = game.players.find((player) => player.id === socket.id);
    if (playerToUpdate) {
      console.log(`🔄 Resetting player slot for ${socket.id}`);
      playerToUpdate.id = null;
      await saveGameToFirestore(game.toJSON());
      io.emit('playerLeft', { playerId: socket.id });
    }
  });
});