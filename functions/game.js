import Deck from './deck.js';

class Game {
  constructor() {
    this.deck = new Deck();
    this.players = [
      { id: null, name: 'Player 1', cards: [], score: 0 },
      { id: null, name: 'Player 2', cards: [], score: 0 }
    ];
    this.currentTurn = 0;
    this.isGameOver = false;
    this.winner = null;
  }

  initialize() {
    this.deck.initialize();
    this.players.forEach(player => {
      player.id = null;  // 🔹 `id: null` を維持
      player.cards = [];
      player.score = 0;
    });
    this.currentTurn = 0;
    this.isGameOver = false;
    this.winner = null;
  }

  drawCard(playerIndex) {
    if (this.isGameOver || this.deck.size === 0) return null;

    const card = this.deck.draw();
    const player = this.players[playerIndex];
    player.cards.push(card);
    player.score += card.value;

    if (player.cards.length === 5 || this.deck.size === 0) {
      this.isGameOver = true;
      let highestScore = -1;
      let winner = null;
      this.players.forEach(p => {
        if (p.score > highestScore) {
          highestScore = p.score;
          winner = p.name;
        }
      });
      this.winner = winner;
    }

    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    return {
      card,
      nextTurn: this.currentTurn,
      isGameOver: this.isGameOver,
      deckSize: this.deck.size,
      winner: this.winner,
    };
  }

  resetGame() {
    this.initialize();
  }

  loadState(state) {
    this.players = state.players.map(player => ({
      id: player.id || null,  // 🔹 `id: null` を維持
      name: player.name,
      cards: player.cards,
      score: player.score
    }));
    this.deck.cards = state.deck;
    this.currentTurn = state.currentTurn;
    this.isGameOver = state.isGameOver;
    this.winner = state.winner;
  }

  toJSON() {
    return {
      players: this.players.map(player => ({
        id: player.id || null,  // 🔹 `id: null` を Firestore に保存
        name: player.name,
        cards: player.cards,
        score: player.score
      })),
      deck: this.deck.cards,
      currentTurn: this.currentTurn,
      isGameOver: this.isGameOver,
      winner: this.winner,
    };
  }
}

export default Game;