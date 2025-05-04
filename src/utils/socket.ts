import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

// Socket 实例
let socket: Socket | null = null;
// 连接尝试次数
let connectionAttempts = 0;
// 最大连接尝试次数
const MAX_CONNECTION_ATTEMPTS = 3;

/**
 * 初始化 WebSocket 连接
 * @param token 用户令牌（不包含 Bearer 前缀）
 */
export const initSocket = (token: string): Socket => {
  // 如果已经有连接且连接已建立，直接返回现有实例
  if (socket && socket.connected) {
    console.log('WebSocket已连接，复用现有连接');
    return socket;
  }

  // 如果已经有连接但未连接成功，先断开
  if (socket) {
    console.log('断开旧的WebSocket连接尝试');
    socket.disconnect();
    socket.removeAllListeners(); // 移除所有事件监听器，防止内存泄漏
    socket = null;
  }

  console.log('初始化新的WebSocket连接...');
  
  // 为v2.x客户端创建连接配置
  const socketOptions = {
    transports: ['websocket'],
    autoConnect: true,
    forceNew: true,
    reconnectionAttempts: MAX_CONNECTION_ATTEMPTS,
    query: {
      token // 在查询参数中也传递token，以便更好地支持某些WebSocket服务器
    }
  };
  
  // 创建新的连接
  socket = io('http://192.168.95.201:9092', socketOptions);

  // 重置连接尝试次数
  connectionAttempts = 0;

  // 连接事件
  socket.on('connect', () => {
    console.log('WebSocket 连接成功');
    connectionAttempts = 0; // 连接成功后重置尝试次数
    
    // v2客户端需要在建立连接后手动发送认证信息
    socket?.emit('authenticate', { token });
  });

  // 断开连接事件
  socket.on('disconnect', (reason) => {
    console.log(`WebSocket 连接断开: ${reason}`);
  });

  // 连接错误事件
  socket.on('connect_error', (error) => {
    console.error('WebSocket 连接错误:', error);
    connectionAttempts++;
    
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.log(`达到最大重连次数(${MAX_CONNECTION_ATTEMPTS})，停止重连`);
      socket?.disconnect();
    }
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
    console.log('正在断开WebSocket连接...');
    socket.disconnect();
    socket.removeAllListeners(); // 移除所有事件监听器，防止内存泄漏
    socket = null;
    connectionAttempts = 0; // 重置连接尝试次数
    console.log('WebSocket连接已完全断开');
  } else {
    console.log('没有活动的WebSocket连接');
  }
}; 