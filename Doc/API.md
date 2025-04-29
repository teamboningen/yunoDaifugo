
# API仕様書

## WebSocket イベント仕様

### クライアント → サーバー

#### `connect`
Socket.IOの接続確立イベント
```javascript
// 自動的に実行される
```

#### `joinGame`
ゲームに参加するイベント
```javascript
// データなし
```

#### `drawCard`
カードを引くイベント
```javascript
// データなし
```

#### `resetGame`
ゲームをリセットするイベント
```javascript
// データなし
```

### サーバー → クライアント

#### `connect`
接続確立の確認
```javascript
// データなし
```

#### `disconnect`
接続切断の通知
```javascript
reason: string  // 切断理由
```

#### `gameFull`
ゲームが満員の通知
```javascript
// データなし
```

#### `gameLoaded`
初期ゲーム状態の送信
```javascript
{
  players: Player[],  // プレイヤー情報
  deck: Card[],      // 山札情報
  currentTurn: number,  // 現在のターン
  isGameOver: boolean,  // ゲーム終了フラグ
  winner: string | null  // 勝者情報
}
```

#### `gameUpdated`
ゲーム状態の更新通知
```javascript
{
  players: Player[],  // プレイヤー情報
  deck: Card[],      // 山札情報
  currentTurn: number,  // 現在のターン
  isGameOver: boolean,  // ゲーム終了フラグ
  winner: string | null,  // 勝者情報
  announcements: {  // ゲーム内アナウンス
    message: string,
    time: string
  }[]
}
```

#### `error`
エラー通知
```javascript
{
  message: string  // エラーメッセージ
}
```

## データ構造

### Player
```typescript
interface Player {
  id: string | null;  // プレイヤーのSocket ID
  name: string;       // プレイヤー名
  cards: Card[];      // 手札
  score: number;      // スコア
  seatIndex: number;  // 座席位置
}
```

### Card
```typescript
interface Card {
  suit: 'Hearts' | 'Diamonds' | 'Spades' | 'Clubs';  // カードのスート
  rank: string;  // カードのランク
  value: number; // カードの得点価値
}
```

## エラーハンドリング

- プレイヤーが見つからない場合: "プレイヤーが見つかりません。"
- カードが引けない場合: "カードが引けませんでした。"
- ゲームが満員の場合: gameFull イベントが発火

## 状態遷移

1. 接続確立 (`connect`)
2. ゲーム参加 (`joinGame`)
3. ゲーム状態受信 (`gameLoaded`)
4. ゲームプレイ中の状態更新 (`gameUpdated`)
5. ゲーム終了またはリセット
