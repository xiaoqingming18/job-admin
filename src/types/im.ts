/**
 * 消息类型枚举
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
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
 * 消息对象
 */
export interface Message {
  id: number;
  senderId: number;
  messageType: MessageType;
  content: string;
  sendTime: string;
  isSelf?: boolean; // 是否为自己发送的消息，用于前端展示
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
}

/**
 * 聊天消息集合
 */
export interface ChatMessages {
  conversationId: number;
  messages: Message[];
} 