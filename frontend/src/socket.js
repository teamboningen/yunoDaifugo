
import { io } from 'socket.io-client';

// 開発環境ではlocalhost、本番環境ではサーバーのURLを使用
const URL = import.meta.env.PROD 
  ? window.location.origin 
  : 'http://localhost:3001';

const socket = io(URL);

export default socket;
