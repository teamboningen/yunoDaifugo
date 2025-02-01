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
    this.winner = null;  // 勝者を記録
  }

  initialize() {
    this.deck.initialize();
    this.players.forEach(player => {
      player.cards = [];
      player.score = 0;
    });
    this.currentTurn = 0;
    this.isGameOver = false;
    this.winner = null;  // 勝者をリセット
  }

  drawCard(playerIndex) {
    if (this.isGameOver || this.deck.size === 0) return null;

    const card = this.deck.draw();
    const player = this.players[playerIndex];
    player.cards.push(card);
    player.score += card.value;

    // ゲーム終了判定
    if (player.cards.length === 5 || this.deck.size === 0) {
      this.isGameOver = true;

      // 勝者を決定
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
      winner: this.winner, // 勝者を含める
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
    this.winner = state.winner; // 勝者の状態も復元
  }

  toJSON() {
    return {
      players: this.players,
      deck: this.deck.cards,
      currentTurn: this.currentTurn,
      isGameOver: this.isGameOver,
      winner: this.winner, // 勝者をJSONに含める
    };
  }
}

export default Game;