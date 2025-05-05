/**
 * 消息类型枚举
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  SYSTEM = 'system'
}

/**
 * 会话类型枚举
 */
export enum ConversationType {
  SINGLE = 'single',
  GROUP = 'group'
}

/**
 * 消息状态枚举
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

/**
 * 用户简要信息
 */
export interface UserInfo {
  id: number;
  username: string;
  avatar?: string;
}

/**
 * 消息对象
 */
export interface Message {
  id: number;
  conversationId?: number;
  senderId: number;
  messageType: MessageType;
  content: string;
  sendTime: string;
  status?: MessageStatus; // 消息状态
  isRecalled?: boolean; // 是否被撤回
  isSelf?: boolean; // 是否为自己发送的消息，用于前端展示
  sender?: UserInfo; // 发送者信息
  mediaUrl?: string; // 媒体URL
  fileName?: string; // 文件名
  fileSize?: number; // 文件大小
}

/**
 * 会话对象
 */
export interface Conversation {
  id: number;
  conversationType: ConversationType;
  title: string;
  avatar?: string;
  lastMessage?: Message;
  createTime: string;
  unreadCount?: number; // 未读消息数，前端自维护
  position?: string; // 职位信息
}

/**
 * 聊天消息集合
 */
export interface ChatMessages {
  conversationId: number;
  messages: Message[];
} 