const { Server } = require('socket.io');
const Game = require('./game');

const game = new Game();
game.initialize();

const io = new Server();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('drawCard', ({ playerIndex }) => {
    const result = game.drawCard(playerIndex);
    if (result) {
      socket.emit('cardDrawn', { ...result, playerIndex });
      io.emit('updateGameState', game);
    }
  });

  socket.on('resetGame', () => {
    game.resetGame();
    io.emit('gameReset');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

exports.handler = (event, context) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: 'Socket.IO server is running.',
    };
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};