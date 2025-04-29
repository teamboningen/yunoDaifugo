
# コンポーネント設計書

## 共通コンポーネント

### OpponentView
対戦相手の情報を表示するコンポーネント

**Props:**
- `playerName`: string - プレイヤー名
- `handSize`: number - 手札の枚数

### PlayerView
プレイヤーの手札と情報を表示するコンポーネント

### AnnouncementBar
ゲーム進行状況を表示するコンポーネント

**Props:**
- `fixedMessage`: string - 固定メッセージ
- `messages`: Message[] - 通知メッセージリスト
