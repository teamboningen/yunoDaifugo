import { io } from "socket.io-client";

                  const socket = io(import.meta.env.VITE_BACKEND_URL || 'https://sufficient-tiffani-teamboningen-58a55eb3.koyeb.app', {
  autoConnect: false, // 明示的に接続
  reconnectionAttempts: 3, // 最大3回まで再接続
  reconnectionDelay: 1000, // 再接続の間隔
});

export default socket;