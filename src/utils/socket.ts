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
    reconnectionDelay: 1000, // 重连延迟，默认为1000ms
    timeout: 20000, // 连接超时时间
    query: {
      token // 在查询参数中也传递token，以便更好地支持某些WebSocket服务器
    },
    auth: {
      token // 在auth参数中也传递token
    }
  };
  
  // 创建新的连接 - 使用当前域名的相对路径而不是硬编码的IP地址
  const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 
                   'http://localhost:9092' : // 本地开发环境
                   `${window.location.protocol}//${window.location.hostname}:9092`; // 生产环境
  
  console.log(`尝试连接WebSocket服务器: ${socketUrl}`);
  socket = io(socketUrl, socketOptions);

  // 重置连接尝试次数
  connectionAttempts = 0;

  // 连接事件
  socket.on('connect', () => {
    console.log('WebSocket 连接成功');
    connectionAttempts = 0; // 连接成功后重置尝试次数
    
    // v2客户端需要在建立连接后手动发送认证信息
    socket?.emit('authenticate', { token });
    console.log('已发送认证信息到WebSocket服务器');
  });

  // 断开连接事件
  socket.on('disconnect', (reason: string) => {
    console.log(`WebSocket 连接断开: ${reason}`);
  });

  // 连接错误事件
  socket.on('connect_error', (error: Error) => {
    console.error('WebSocket 连接错误:', error);
    connectionAttempts++;
    
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.log(`达到最大重连次数(${MAX_CONNECTION_ATTEMPTS})，停止重连`);
      socket?.disconnect();
    }
  });
  
  // 添加调试消息接收器
  socket.on('im:message', (data: any) => {
    console.log('WebSocket收到im:message事件:', data);
  });

  return socket;
};

/**
 * 获取 Socket 实例
 */
export const getSocket = (): Socket | null => {
  // 如果socket存在但断开了连接，尝试重新初始化
  if (socket && !socket.connected) {
    console.log('Socket实例存在但未连接，可能需要重新初始化');
  }
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