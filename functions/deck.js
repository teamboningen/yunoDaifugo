class Deck {
  constructor() {
    this.suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    this.ranks = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10',
      'Jack', 'Queen', 'King', 'Ace'
    ];
    this.cards = [];
  }

  initialize() {
    this.cards = [];
    this.suits.forEach((suit) => {
      this.ranks.forEach((rank) => {
        const value =
          rank === 'Ace' ? 11 :
          ['King', 'Queen', 'Jack'].includes(rank) ? 10 : parseInt(rank, 10);
        this.cards.push({ rank, suit, value });
      });
    });
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    return this.cards.pop();
  }

  get size() {
    return this.cards.length;
  }
}

module.exports = Deck;