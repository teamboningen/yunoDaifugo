import Deck from './deck.js';

class Game {
  constructor() {
    this.deck = new Deck();
    this.players = [
      { name: 'Player 1', cards: [], score: 0 },
      { name: 'Player 2', cards: [], score: 0 },
    ];
    this.currentTurn = 0;
    this.isGameOver = false;
  }

  initialize() {
    this.deck.initialize();
    this.players.forEach(player => {
      player.cards = [];
      player.score = 0;
    });
    this.currentTurn = 0;
    this.isGameOver = false;
  }

  drawCard(playerIndex) {
    if (this.isGameOver || this.deck.size === 0) return null;

    const card = this.deck.draw();
    const player = this.players[playerIndex];
    player.cards.push(card);
    player.score += card.value;

    if (player.cards.length === 5 || this.deck.size === 0) {
      this.isGameOver = true;
    }

    this.currentTurn = (this.currentTurn + 1) % this.players.length;
    return {
      card,
      nextTurn: this.currentTurn,
      isGameOver: this.isGameOver,
      deckSize: this.deck.size,
    };
  }

  resetGame() {
    this.initialize();
  }

  loadState(state) {
    this.players = state.players;
    this.deck.cards = state.deck;
    this.currentTurn = state.currentTurn;
    this.isGameOver = state.isGameOver;
  }

  toJSON() {
    return {
      players: this.players,
      deck: this.deck.cards,
      currentTurn: this.currentTurn,
      isGameOver: this.isGameOver,
    };
  }
}

export default Game;