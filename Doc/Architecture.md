
# システムアーキテクチャ設計書

## 全体構成
```
Client (React) <-> WebSocket <-> Server (Express) <-> Firebase
```

## クライアントサイド構成
- React (Vite)
- Socket.IO Client
- Tailwind CSS
- shadcn/ui

### 主要コンポーネント
1. App.jsx - メインアプリケーション
2. PlayerView - プレイヤー情報表示
3. OpponentView - 対戦相手情報表示
4. CardDeck - 山札UI
5. AnnouncementBar - ゲーム進行状況表示

## サーバーサイド構成
- Express.js
- Socket.IO
- Firebase Admin SDK

### 主要モジュール
1. server.js - Webサーバーとソケット通信
2. game.js - ゲームロジック
3. deck.js - カードデッキ管理
4. firebase.js - データベース連携
