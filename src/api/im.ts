import { get, post } from '@/utils/request'

/**
 * 获取用户的所有会话列表
 * @param userId 用户ID
 * @returns 会话列表
 */
export const getUserConversations = (userId: number) => {
  return get(`/api/im/conversations/user/${userId}`)
}

/**
 * 获取指定会话详情
 * @param conversationId 会话ID
 * @returns 会话详情
 */
export const getConversationDetail = (conversationId: number) => {
  return get(`/api/im/conversations/${conversationId}`)
}

/**
 * 创建单聊会话
 * @param userIdA 用户A的ID
 * @param userIdB 用户B的ID
 * @returns 创建的会话信息
 */
export const createSingleConversation = (userIdA: number, userIdB: number) => {
  return post('/api/im/conversations/single', { userIdA, userIdB })
}

/**
 * 发送文本消息
 * @param conversationId 会话ID
 * @param senderId 发送者ID
 * @param content 消息内容
 * @returns 发送的消息信息
 */
export const sendTextMessage = (conversationId: number, senderId: number, content: string) => {
  return post('/api/im/messages/text', { conversationId, senderId, content })
}

/**
 * 发送图片消息
 * @param conversationId 会话ID
 * @param senderId 发送者ID
 * @param mediaUrl 图片URL
 * @returns 发送的消息信息
 */
export const sendImageMessage = (conversationId: number, senderId: number, mediaUrl: string) => {
  return post('/api/im/messages/image', { conversationId, senderId, mediaUrl })
}

/**
 * 发送媒体消息
 * @param conversationId 会话ID
 * @param senderId 发送者ID
 * @param mediaUrl 媒体URL
 * @param messageType 消息类型
 * @returns 发送的消息信息
 */
export const sendMediaMessage = (
  conversationId: number, 
  senderId: number, 
  mediaUrl: string,
  messageType: string = 'image'
) => {
  return post('/api/im/messages/media', { 
    conversationId, 
    senderId, 
    mediaUrl,
    messageType
  })
}

/**
 * 发送文件消息
 * @param conversationId 会话ID
 * @param senderId 发送者ID
 * @param mediaUrl 文件URL
 * @param fileName 文件名
 * @param fileSize 文件大小
 * @returns 发送的消息信息
 */
export const sendFileMessage = (
  conversationId: number, 
  senderId: number, 
  mediaUrl: string, 
  fileName: string, 
  fileSize: number
) => {
  return post('/api/im/messages/file', { 
    conversationId, 
    senderId, 
    mediaUrl, 
    fileName, 
    fileSize 
  })
} 