interface Collections {
  games: {
    [gameId: string]: GameDocument;
  };
  decks: {
    [deckId: string]: DeckDocument;
  };
}

interface DeckDocument {
  id: string;                 // デッキID
  cards: Card[];             // カード配列
  remainingCards: number;    // 残りカード枚数
  isShuffled: boolean;       // シャッフル済みフラグ
  lastUpdated: Timestamp;    // 最終更新日時
}

interface Card {
  id: string;               // カードID (例: "H-A" for Hearts-Ace)
  suit: CardSuit;          // カードのスート
  rank: CardRank;          // カードのランク
  value: number;           // ゲーム内での数値（2-11）
  isDealt: boolean;        // 配布済みフラグ
  currentLocation: {       // カードの現在位置
    type: 'deck' | 'player' | 'discard';
    id: string;            // 所有者ID（デッキIDまたはプレイヤーID）
  };
}

type CardSuit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King' | 'Ace';

// 仮のGameDocumentインターフェース
interface GameDocument {
    id: string;
    players: string[];
    deckId: string;
    // その他ゲームに関する情報
}

// 仮のTimestamp型
type Timestamp = number; // ここでは数値で代表