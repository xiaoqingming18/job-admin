import { io, Socket } from 'socket.io-client';

// Socket 实例
let socket: Socket | null = null;

/**
 * 初始化 WebSocket 连接
 * @param token 用户令牌（不包含 Bearer 前缀）
 */
export const initSocket = (token: string): Socket => {
  // 如果已经有连接，先断开
  if (socket) {
    socket.disconnect();
  }

  // 创建新的连接
  socket = io('http://192.168.95.201:9092', {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    query: {
      token // 在查询参数中也传递token，以便更好地支持某些WebSocket服务器
    }
  });

  // 连接事件
  socket.on('connect', () => {
    console.log('WebSocket 连接成功');
  });

  // 断开连接事件
  socket.on('disconnect', (reason) => {
    console.log(`WebSocket 连接断开: ${reason}`);
  });

  // 连接错误事件
  socket.on('connect_error', (error) => {
    console.error('WebSocket 连接错误:', error);
  });

  return socket;
};

/**
 * 获取 Socket 实例
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * 断开 WebSocket 连接
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 