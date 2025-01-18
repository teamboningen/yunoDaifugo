import { Server } from 'socket.io';
import Game from './game.js';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();
const GAME_DOC_ID = 'currentGame'; // Firestoreに保存するドキュメントID
const io = new Server({ cors: { origin: '*' } });

// Firestoreからゲームの状態をロード
async function loadGameFromFirestore() {
  const gameDoc = await firestore.collection('games').doc(GAME_DOC_ID).get();
  return gameDoc.exists ? gameDoc.data() : null;
}

// Firestoreにゲームの状態を保存
async function saveGameToFirestore(gameState) {
  await firestore.collection('games').doc(GAME_DOC_ID).set(gameState);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('loadGame', async () => {
    const currentGameState = await loadGameFromFirestore();
    if (currentGameState) {
      socket.emit('gameLoaded', currentGameState);
    } else {
      const game = new Game();
      game.initialize();
      await saveGameToFirestore(game.toJSON());
      socket.emit('gameLoaded', game.toJSON());
    }
  });

  socket.on('drawCard', async ({ playerIndex }) => {
    const currentGameState = await loadGameFromFirestore();
    const game = new Game();
    if (currentGameState) {
      game.loadState(currentGameState);
    }

    const result = game.drawCard(playerIndex);
    if (result) {
      await saveGameToFirestore(game.toJSON());
      io.emit('cardDrawn', { ...result, players: game.players });
    }
  });

  socket.on('resetGame', async () => {
    const game = new Game();
    game.initialize();
    await saveGameToFirestore(game.toJSON());
    io.emit('gameReset', game.toJSON());
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export const handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: 'Socket.IO server is running.',
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};