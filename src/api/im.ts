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