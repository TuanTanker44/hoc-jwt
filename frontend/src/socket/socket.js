import { io } from "socket.io-client";

const URL = "http://localhost:5000";

export const socket = io(URL, {
  withCredentials: true,
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("token"),
  },
});

// Hàm chủ động ngắt kết nối socket
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
