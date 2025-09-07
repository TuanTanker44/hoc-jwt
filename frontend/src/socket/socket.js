import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: true, // kết nối ngay khi import
  transports: ["websocket"], // ưu tiên websocket
});

export default socket;
