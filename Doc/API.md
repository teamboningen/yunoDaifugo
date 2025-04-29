
# API仕様書

## WebSocket イベント

### クライアント → サーバー

#### `join-game`
ゲームに参加するイベント
```javascript
{
  playerName: string  // プレイヤー名
}
```

### サーバー → クライアント

#### `game-state`
ゲーム状態の更新
```javascript
{
  players: Player[]  // プレイヤー情報
  currentTurn: string  // 現在のターンのプレイヤーID
  deck: Card[]  // 山札情報
}
```
