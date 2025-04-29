
# データベース設計書

## Firestore コレクション構造

### games コレクション
ゲームの状態を管理する主要コレクション

#### Document構造
```typescript
interface GameDocument {
  deck: Card[];              // カードの配列
  players: Player[];         // プレイヤー配列
  currentTurn: number;       // 現在のターン（0または1）
  isGameOver: boolean;       // ゲーム終了フラグ
  winner: string | null;     // 勝者情報
}

interface Player {
  id: string | null;         // Socket.IOによる接続ID
  name: string;              // プレイヤー名
  cards: Card[];            // 所持カード配列
  score: number;            // 現在のスコア
  seatIndex: number;        // 着席位置（0または1）
}

interface Card {
  suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';  // カードのスート
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 
        'Jack' | 'Queen' | 'King' | 'Ace';          // カードのランク
  value: number;                                     // ゲーム内での数値（2-11）
}
```

## データの整合性ルール
1. プレイヤー数は常に2人まで
2. カードの重複は不可
3. スコアは各カードのvalueの合計
4. プレイヤーの手札は5枚まで

## データ更新タイミング
- プレイヤー参加時
- カードドロー時
- ゲーム終了判定時
- ゲームリセット時
