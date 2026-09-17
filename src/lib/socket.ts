import { io, type Socket } from 'socket.io-client';

const AUTH_TOKEN_KEY = 'couplenest_auth_token';
let socket: Socket | null = null;

/** Socket.IO must point at the long-running Oracle backend. */
export const getSocket = (): Socket | null => {
  if (socket) return socket;
  const configured = (import.meta.env.VITE_SOCKET_URL || '').trim();
  if (!configured) return null;

  socket = io(configured.replace(/\/$/, ''), {
    withCredentials: true,
    autoConnect: false,
    auth: cb => ({ token: localStorage.getItem(AUTH_TOKEN_KEY) || undefined }),
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 7000,
  });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
