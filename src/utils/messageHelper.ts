import type { Message } from '@/types/im'
import { MessageStatus, MessageType } from '@/types/im'

/**
 * 消息工具函数集
 */

/**
 * 强制更新消息对象，确保Vue响应式特性正常工作
 * 
 * @param messages 消息数组
 * @param messageIndex 需要更新的消息索引
 * @param updatedData 要更新的消息数据
 * @returns 新的消息数组
 */
export function updateMessage(
  messages: Message[],
  messageIndex: number,
  updatedData: Partial<Message>
): Message[] {
  if (messageIndex < 0 || messageIndex >= messages.length) {
    return messages
  }
  
  // 创建新数组，确保响应式更新
  const newMessages = [...messages]
  
  // 使用解构合并更新消息
  newMessages[messageIndex] = {
    ...newMessages[messageIndex],
    ...updatedData
  }
  
  return newMessages
}

/**
 * 添加消息到数组中
 * 
 * @param messages 现有消息数组
 * @param message 新消息
 * @returns 新的消息数组
 */
export function addMessage(messages: Message[], message: Message): Message[] {
  return [...(messages || []), message]
}

/**
 * 创建临时消息对象
 * 
 * @param userId 当前用户ID
 * @param conversationId 会话ID
 * @param content 消息内容
 * @param messageType 消息类型，默认为文本
 * @returns 临时消息对象
 */
export function createTempMessage(
  userId: number,
  conversationId: number,
  content: string,
  messageType: MessageType = MessageType.TEXT
): Message {
  return {
    id: Date.now(),  // 临时ID
    conversationId,
    senderId: userId,
    messageType,
    content,
    sendTime: new Date().toISOString(),
    status: MessageStatus.SENDING,
    isSelf: true
  }
}

/**
 * 查找消息索引
 * 
 * @param messages 消息数组
 * @param messageId 消息ID
 * @returns 消息索引，如果找不到返回-1
 */
export function findMessageIndex(messages: Message[], messageId: number): number {
  return messages.findIndex(msg => msg.id === messageId)
} 