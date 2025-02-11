import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Game from './game.js';
import { Firestore } from '@google-cloud/firestore';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const firestore = new Firestore();
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

  socket.on('loadGame', async () => {
    /*const currentGameState = await loadGameFromFirestore();
    if (currentGameState) {
      socket.emit('gameLoaded', currentGameState);
    } else {
      const game = new Game();
      game.initialize();
      await saveGameToFirestore(game.toJSON());
      socket.emit('gameLoaded', game.toJSON());
    }*/

      console.log('loadGame request received');
      socket.emit('gameLoaded', { message: 'loadGame request received successfully' });
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
      io.emit('cardDrawn', { ...result, players: game.players, winner: game.winner });
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

app.get('/', (req, res) => {
  res.send("Koyeb Backend is running...");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});