
import Deck from './deck.js';

class Game {
  constructor() {
    this.deck = new Deck();
    this.players = [
      { id: null, name: 'Player 1', cards: [], score: 0, seatIndex: 0 },
      { id: null, name: 'Player 2', cards: [], score: 0, seatIndex: 1 }
    ];
    this.currentTurn = 0;
    this.isGameOver = false;
    this.winner = null;
  }

  initialize() {
    this.deck.initialize();
    this.players.forEach(player => {
      player.id = null;
      player.cards = [];
      player.score = 0;
    });
    this.currentTurn = 0;
    this.isGameOver = false;
    this.winner = null;
  }

  // プレイヤーをルームに追加
  addPlayer(socketId, playerName, seatIndex) {
    if (seatIndex < 0 || seatIndex >= this.players.length) {
      return false;
    }
    
    const targetSlot = this.players[seatIndex];
    if (targetSlot.id !== null) {
      return false;
    }

    targetSlot.id = socketId;
    targetSlot.name = playerName;
    return true;
  }

  // プレイヤーをルームから削除
  removePlayer(socketId) {
    const player = this.players.find(p => p.id === socketId);
    if (!player) {
      return false;
    }
    
    player.id = null;
    return true;
  }

  // 空席があるかチェック
  hasEmptySeat() {
    return this.players.some(player => player.id === null);
  }

  // アクティブなプレイヤー数を取得
  getActivePlayerCount() {
    return this.players.filter(player => player.id !== null).length;
  }

  drawCard(playerIndex) {
    if (this.isGameOver || this.deck.size === 0) return null;

    const card = this.deck.draw();
    const player = this.players[playerIndex];
    player.cards.push(card);
    player.score += card.value;

    if (this.players.every(p => p.cards.length >= 5) || this.deck.size === 0) {
      this.isGameOver = true;
      let highestScore = -1;
      let winners = [];
      
      this.players.forEach(p => {
        if (p.score > highestScore) {
          highestScore = p.score;
        }
      });
      
      this.players.forEach(p => {
        if (p.score === highestScore) {
          winners.push(p.name);
        }
      });
      
      this.winner = winners.length > 1 ? '引き分け' : winners[0];
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
      id: player.id || null,
      name: player.name,
      cards: player.cards,
      score: player.score,
      seatIndex: player.seatIndex
    }));
    this.deck.cards = state.deck;
    this.currentTurn = state.currentTurn;
    this.isGameOver = state.isGameOver;
    this.winner = state.winner;
  }

  toJSON() {
    return {
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
        seatIndex: player.seatIndex,
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
