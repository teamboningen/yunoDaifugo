import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Game from './game.js';
import firestore from './firebase.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ルーム管理用の定数
const MAX_PLAYERS_PER_ROOM = 2;

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

async function loadGameFromFirestore(roomId) {
  try {
    console.log(`📌 Firestore: Loading game state for room ${roomId}...`);
    const gameDoc = await firestore.collection('games').doc(roomId).get();
    if (!gameDoc.exists) {
      console.log(`⚠️ Firestore: No existing game found for room ${roomId}.`);
      return null;
    }
    console.log("✅ Firestore: Game state loaded successfully.");
    return gameDoc.data();
  } catch (error) {
    console.error("❌ Firestore Error: Failed to load game:", error);
    return null;
  }
}

async function saveGameToFirestore(roomId, gameState) {
  try {
    console.log(`📌 Firestore: Saving game state for room ${roomId}...`);
    await firestore.collection('games').doc(roomId).set(gameState);
    console.log("✅ Firestore: Game state saved successfully.");
  } catch (error) {
    console.error("❌ Firestore Error: Failed to save game:", error);
  }
}

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // roomName のみ保持
  socket.data.roomName = null;


  // ルーム作成イベントハンドラー
  socket.on('createRoom', async ({ roomName, playerName }) => {
    console.log(`🎮 createRoom received from ${socket.id}: room=${roomName}, player=${playerName}`);

    // 既存のルームをチェック
    const existingGame = await loadGameFromFirestore(roomName);
    if (existingGame) {
      socket.emit('error', { message: 'このルーム名は既に使用されています。' });
      return;
    }

    // 新規ゲームを作成
    const game = new Game();
    game.initialize();

    // 作成者を登録
    const player = game.players[0];
    player.id = socket.id;
    player.name = playerName;

    // ルームに参加
    socket.join(roomName);
    socket.data.roomName = roomName; // Update roomName in socket.data

    // ゲーム状態を保存
    await saveGameToFirestore(roomName, game.toJSON());

    // ルーム参加イベントを送信
    socket.emit('roomJoined');

    // ゲーム状態を送信
    socket.emit('gameLoaded', formatGameStateForPlayer(game.toJSON(), socket.id));
  });

  // ルーム参加イベントハンドラー
  socket.on('joinRoom', async ({ roomName, playerName }) => {
    console.log(`🎮 joinRoom received from ${socket.id}: room=${roomName}, player=${playerName}`);

    // ルームの存在確認
    const gameState = await loadGameFromFirestore(roomName);
    if (!gameState) {
      socket.emit('error', { message: 'ルームが見つかりません。' });
      return;
    }

    const game = new Game();
    game.loadState(gameState);

    // 参加可能か確認
    const activePlayers = game.players.filter(p => p.id !== null);
    if (activePlayers.length >= MAX_PLAYERS_PER_ROOM) {
      socket.emit('gameFull');
      return;
    }

    // 空いている席を探して登録
    const emptySlot = game.players.find(p => p.id === null);
    if (emptySlot) {
      emptySlot.id = socket.id;
      emptySlot.name = playerName;

      // ルームに参加
      socket.join(roomName);
      socket.data.roomName = roomName; // Update roomName in socket.data

      // ゲーム状態を保存
      await saveGameToFirestore(roomName, game.toJSON());

      // ルーム参加イベントを送信
      socket.emit('roomJoined');

      // 全プレイヤーに更新を通知
      const updatedState = game.toJSON();
      const announcements = [{
        message: `${playerName} が参加しました`,
        time: new Date().toISOString()
      }];

      game.players.forEach(player => {
        if (player.id) {
          io.to(player.id).emit('gameUpdated', {
            ...formatGameStateForPlayer(updatedState, player.id),
            announcements
          });
        }
      });
    }
  });

  // ルーム離脱イベントハンドラー
  socket.on('leaveRoom', async () => {
    const roomName = socket.data.roomName;
    if (!roomName) {
      console.log(`🔌 leaveRoom received from ${socket.id}, but no room name found in socket.data`);
      return;
    }
    
    console.log(`🔌 leaveRoom received from ${socket.id}: room=${roomName}`);

    const gameState = await loadGameFromFirestore(roomName);
    if (!gameState) return;

    const game = new Game();
    game.loadState(gameState);

    const leavingPlayer = game.players.find(p => p.id === socket.id);
    if (leavingPlayer) {
      const playerName = leavingPlayer.name;
      leavingPlayer.id = null;

      // ルームから退出
      socket.leave(roomName);
      socket.data.roomName = null; // Update roomName in socket.data

      // ゲーム状態を保存
      await saveGameToFirestore(roomName, game.toJSON());

      // 残りのプレイヤーに通知
      const announcements = game.announcements || [];
      announcements.push({
        message: `${playerName} が退出しました`,
        time: new Date().toISOString()
      });

      game.players.forEach(player => {
        if (player.id) {
          io.to(player.id).emit('gameUpdated', {
            ...formatGameStateForPlayer(game.toJSON(), player.id),
            announcements
          });
        }
      });
    }
  });

  // 以下は既存のイベントハンドラー
  socket.on('drawCard', async () => {
    console.log(`🎴 drawCard received from: ${socket.id}`);
    
    const roomName = socket.data.roomName;
    if (!roomName) {
      console.log(`🎴 drawCard received from ${socket.id}, but no room name found in socket.data`);
      socket.emit('error', { message: 'ルーム情報が見つかりません。' });
      return;
    }

    const currentGameState = await loadGameFromFirestore(roomName);
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
      const drawer = game.players[playerIndex];
      const nextPlayer = game.players[game.currentTurn];
      const announcements = [
        {
          message: `${nextPlayer.name} のターンです`,
          time: new Date().toISOString()
        },
        {
          message: `${drawer.name} がカードを引きました`,
          time: new Date().toISOString()
        }
      ];

      if (result.isGameOver && result.winner) {
        announcements.unshift({
          message: `ゲーム終了！ ${result.winner} の勝利です！`,
          time: new Date().toISOString()
        });
      }
      console.log("✅ Card drawn successfully.");
      const gameState = game.toJSON();
      await saveGameToFirestore(socket.data.roomName, gameState);

      game.players.forEach(player => {
        if (player.id) {  // Only emit to connected players
          io.to(player.id).emit('gameUpdated', {
            ...formatGameStateForPlayer(gameState, player.id),
            announcements
          });
        }
      });
    } else {
      console.error("❌ Card draw failed.");
      socket.emit('error', { message: 'カードが引けませんでした。' });
    }
  });

  socket.on('resetGame', async () => {
    console.log('🔄 Game reset requested by:', socket.id);
    const roomName = socket.data.roomName;
    if (!roomName) {
      console.log(`🔄 resetGame received from ${socket.id}, but no room name found in socket.data`);
      socket.emit('error', { message: 'ルーム情報が見つかりません。' });
      return;
    }
    
    const currentGameState = await loadGameFromFirestore(roomName);
    const game = new Game();

    if (currentGameState) {
      game.loadState(currentGameState);
    }

    console.log("🆕 Initializing new game state...");
    game.initialize();

    await saveGameToFirestore(roomName, game.toJSON());
    const currentPlayer = game.players[game.currentTurn];
    const now = new Date().toISOString();
    const announcements = [
      { message: 'ゲームがリセットされました。', time: now },
      { message: `${currentPlayer.name} のターンです`, time: now }
    ];
    const gameState = game.toJSON();
    game.players.forEach(player => {
      io.to(player.id).emit('gameUpdated', {
        ...formatGameStateForPlayer(gameState, player.id),
        announcements
      });
    });
    console.log('✅ Game has been reset.');
  });

  socket.on('disconnect', async () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    const roomName = socket.data.roomName;

    if (roomName) {
      console.log(`🔌 User disconnected from room: ${roomName}`);
      const currentGameState = await loadGameFromFirestore(roomName);
      if (!currentGameState) return;

      const game = new Game();
      game.loadState(currentGameState);

      const playerToUpdate = game.players.find((player) => player.id === socket.id);
      if (playerToUpdate) {
        console.log(`🔄 Resetting player slot for ${socket.id}`);
        playerToUpdate.id = null;
        await saveGameToFirestore(roomName, game.toJSON());
        const now = new Date().toISOString();
        const announcements = [
          { message: `${playerToUpdate.name} が退出しました`, time: now }
        ];
        game.players.forEach(player => {
          io.to(player.id).emit('gameUpdated', {
            ...formatGameStateForPlayer(game.toJSON(), player.id),
            announcements
          });
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});