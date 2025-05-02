<template>
  <div class="chat-container">
    <div class="chat-sidebar">
      <div class="chat-header">
        <h3>求职者列表</h3>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索求职者..."
          prefix-icon="Search"
          clearable
          @input="searchConversations"
        />
      </div>
      <div class="chat-list">
        <el-scrollbar>
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            class="chat-item"
            :class="{ 'active': currentConversation?.id === conversation.id }"
            @click="selectConversation(conversation)"
          >
            <el-badge :value="conversation.unreadCount || null" :hidden="!conversation.unreadCount">
              <el-avatar :size="40" :src="conversation.avatar || defaultAvatar">
                {{ conversation.title.charAt(0) }}
              </el-avatar>
            </el-badge>
            <div class="chat-info">
              <div class="chat-name">{{ conversation.title }}</div>
              <div class="chat-position">{{ conversation.position }}</div>
              <div class="chat-last-message">{{ conversation.lastMessage || '暂无消息' }}</div>
            </div>
            <div class="chat-time">{{ conversation.lastTime || '' }}</div>
          </div>
          <el-empty v-if="filteredConversations.length === 0" description="暂无求职者会话" />
        </el-scrollbar>
      </div>
    </div>
    
    <div class="chat-main">
      <template v-if="currentConversation">
        <div class="chat-main-header">
          <div class="user-info">
            <h3>{{ currentConversation.title }}</h3>
            <div class="position">{{ currentConversation.position }}</div>
          </div>
          <div class="actions">
            <el-button type="primary" size="small" @click="viewApplicantDetail">
              查看详情
            </el-button>
          </div>
        </div>
        
        <div class="chat-messages" ref="messagesContainer">
          <el-scrollbar ref="messagesScrollbar">
            <div class="message-date" v-if="currentChat.messages.length > 0">
              {{ formatMessageDate(currentChat.messages[0].sendTime) }}
            </div>
            <div 
              v-for="(message, index) in currentChat.messages" 
              :key="message.id"
              class="message-item"
              :class="{ 'message-self': message.isSelf }"
            >
              <!-- 如果需要显示日期分隔线 -->
              <div class="message-date" v-if="shouldShowDate(message, index)">
                {{ formatMessageDate(message.sendTime) }}
              </div>
              
              <div class="message-content">
                <el-avatar 
                  v-if="!message.isSelf" 
                  :size="36" 
                  :src="currentConversation.avatar || defaultAvatar"
                >
                  {{ currentConversation.title.charAt(0) }}
                </el-avatar>
                
                <div class="message-bubble">
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatMessageTime(message.sendTime) }}</div>
                </div>
                
                <el-avatar 
                  v-if="message.isSelf" 
                  :size="36" 
                  :src="userAvatar || defaultAvatar"
                >
                  {{ userName.charAt(0) }}
                </el-avatar>
              </div>
            </div>
            
            <div class="message-status" v-if="isTyping">
              对方正在输入...
            </div>
          </el-scrollbar>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="messageContent"
            type="textarea"
            :rows="3"
            placeholder="请输入消息..."
            resize="none"
            @keydown.enter.prevent="sendMessage"
          />
          <div class="input-actions">
            <el-button type="primary" @click="sendMessage" :disabled="!messageContent.trim()">
              发送
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="chat-empty" v-else>
        <el-empty description="请选择一位求职者开始聊天" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatDate, formatTimeAgo } from '@/utils/format'
import { getSocket } from '@/utils/socket'
import { getUserConversations, getConversationDetail, createSingleConversation } from '@/api/im'
import { getUserId } from '@/utils/auth'
import type { Conversation, Message, ChatMessages } from '@/types/im'
import { ConversationType, MessageType } from '@/types/im'

// 默认头像
const defaultAvatar = new URL('@/assets/default-avatar.png', import.meta.url).href

// 路由
const router = useRouter()
const route = useRoute()

// 当前用户信息
const userName = ref(localStorage.getItem('userName') || '管理员')
const userAvatar = ref('')
const userId = ref(getUserId() || 0)

// 搜索关键词
const searchKeyword = ref('')

// 消息输入内容
const messageContent = ref('')

// 是否正在输入
const isTyping = ref(false)

// DOM引用
const messagesScrollbar = ref()
const messagesContainer = ref()

// 当前选中的会话
const currentConversation = ref<Conversation | null>(null)

// 会话列表
const conversations = ref<Conversation[]>([])

// 会话消息记录
const chatMessages = reactive<Record<number, Message[]>>({})

// 加载状态
const loading = ref(false)
const loadingMessages = ref(false)

// 根据搜索关键词过滤会话
const filteredConversations = computed(() => {
  if (!searchKeyword.value) {
    return conversations.value
  }
  return conversations.value.filter(conversation => 
    conversation.title.includes(searchKeyword.value)
  )
})

// 当前聊天记录
const currentChat = computed(() => {
  if (!currentConversation.value) {
    return { conversationId: 0, messages: [] }
  }
  return {
    conversationId: currentConversation.value.id,
    messages: chatMessages[currentConversation.value.id] || []
  }
})

// 选择会话
const selectConversation = async (conversation: Conversation) => {
  currentConversation.value = conversation
  
  // 如果有未读消息，设置为已读
  if (conversation.unreadCount) {
    conversation.unreadCount = 0
  }
  
  // 如果没有加载过该会话的消息，则加载
  if (!chatMessages[conversation.id] || chatMessages[conversation.id].length === 0) {
    await loadConversationMessages(conversation.id)
  }
  
  // 滚动到最新消息
  nextTick(() => {
    scrollToBottom()
  })
}

// 加载会话消息
const loadConversationMessages = async (conversationId: number) => {
  loadingMessages.value = true
  try {
    // 获取会话详情
    const response = await getConversationDetail(conversationId)
    if (response.code === 0 && response.data) {
      const conversation = response.data as Conversation
      
      // 获取历史消息
      // 实际应用中，这里应该有一个获取历史消息的API
      // 目前使用模拟数据
      const mockMessages: Message[] = []
      
      // 如果有最后一条消息，添加到消息列表
      if (conversation.lastMessage) {
        // 标记是否为自己发送的消息
        conversation.lastMessage.isSelf = conversation.lastMessage.senderId === userId.value
        mockMessages.push(conversation.lastMessage)
      }
      
      // 将消息保存到对应会话的消息记录中
      chatMessages[conversationId] = mockMessages
    } else {
      ElMessage.error(response.message || '获取会话详情失败')
    }
  } catch (error) {
    console.error('加载会话消息失败:', error)
    ElMessage.error('加载会话消息失败')
  } finally {
    loadingMessages.value = false
  }
}

// 发送消息
const sendMessage = () => {
  if (!messageContent.value.trim() || !currentConversation.value) return
  
  // 获取Socket实例
  const socket = getSocket()
  
  // 创建新消息
  const newMessage: Message = {
    id: Date.now(),
    senderId: userId.value,
    messageType: MessageType.TEXT,
    content: messageContent.value,
    sendTime: new Date().toISOString(),
    isSelf: true
  }
  
  // 如果没有该会话的聊天记录，初始化一个
  if (!chatMessages[currentConversation.value.id]) {
    chatMessages[currentConversation.value.id] = []
  }
  
  // 添加到聊天记录
  chatMessages[currentConversation.value.id].push(newMessage)
  
  // 更新最近消息
  if (currentConversation.value) {
    currentConversation.value.lastMessage = newMessage
  }
  
  // 如果连接了WebSocket，发送消息
  if (socket) {
    socket.emit('send_message', {
      conversationId: currentConversation.value.id,
      content: messageContent.value
    })
  }
  
  // 清空输入框
  messageContent.value = ''
  
  // 滚动到最新消息
  nextTick(() => {
    scrollToBottom()
  })
}

// 搜索会话
const searchConversations = () => {
  // 前端直接过滤，由 filteredConversations 计算属性处理
}

// 查看求职者详情
const viewApplicantDetail = () => {
  if (!currentConversation.value) return
  
  // 通过标题提取求职者ID，这里假设会话标题格式为"与XXX的会话"
  const titleMatch = currentConversation.value.title.match(/与(.+)的会话/)
  if (titleMatch && titleMatch[1]) {
    const applicantName = titleMatch[1]
    
    // 查找对应的求职者ID，这里需要后端支持通过名称查找
    // 目前简单使用会话ID作为求职者ID
    const applicantId = currentConversation.value.id
    
    // 跳转到求职者详情页面
    router.push(`/dashboard/job-applications/${applicantId}`)
  } else {
    ElMessage.warning('无法获取求职者信息')
  }
}

// 格式化消息日期
const formatMessageDate = (date) => {
  return formatDate(date, 'YYYY年MM月DD日')
}

// 格式化消息时间
const formatMessageTime = (date) => {
  return formatDate(date, 'HH:mm')
}

// 是否需要显示日期分隔线
const shouldShowDate = (message, index) => {
  if (index === 0) return false
  
  const prevMessage = currentChat.value.messages[index - 1]
  const prevDate = new Date(prevMessage.sendTime).setHours(0, 0, 0, 0)
  const currentDate = new Date(message.sendTime).setHours(0, 0, 0, 0)
  
  return prevDate !== currentDate
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesScrollbar.value) {
    const scrollbar = messagesScrollbar.value.$el.querySelector('.el-scrollbar__wrap')
    scrollbar.scrollTop = scrollbar.scrollHeight
  }
}

// 注册WebSocket事件
const registerSocketEvents = () => {
  const socket = getSocket()
  if (!socket) return
  
  // 接收新消息
  socket.on('receive_message', (data) => {
    const { conversationId, senderId, content } = data
    
    // 查找对应会话
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) return
    
    // 创建新消息
    const newMessage: Message = {
      id: Date.now(),
      senderId,
      messageType: MessageType.TEXT,
      content,
      sendTime: new Date().toISOString(),
      isSelf: senderId === userId.value
    }
    
    // 如果没有该会话的聊天记录，初始化一个
    if (!chatMessages[conversationId]) {
      chatMessages[conversationId] = []
    }
    
    // 添加到聊天记录
    chatMessages[conversationId].push(newMessage)
    
    // 更新会话的最后一条消息
    conversation.lastMessage = newMessage
    
    // 如果不是当前选中的会话，增加未读消息数
    if (!currentConversation.value || currentConversation.value.id !== conversationId) {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1
    } else {
      // 当前正在查看该会话，滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    // 新消息提示
    ElMessage({
      message: `收到新消息`,
      type: 'success'
    })
  })
  
  // 对方正在输入
  socket.on('typing', (data) => {
    const { conversationId } = data
    
    // 如果当前正在查看该会话，显示正在输入状态
    if (currentConversation.value && currentConversation.value.id === conversationId) {
      isTyping.value = true
      
      // 3秒后自动清除
      setTimeout(() => {
        isTyping.value = false
      }, 3000)
    }
  })
}

// 监听路由参数变化，如果从求职者详情页跳转过来，则创建或选择对应会话
watch(() => route.query, async (query) => {
  if (query.applicantId && query.name) {
    const applicantId = Number(query.applicantId)
    const applicantName = query.name as string
    
    // 先检查是否已经有与该求职者的会话
    const existingConversation = conversations.value.find(c => {
      return c.title.includes(applicantName)
    })
    
    if (existingConversation) {
      // 如果已经有会话，直接选中
      selectConversation(existingConversation)
    } else {
      // 如果没有会话，创建新会话
      try {
        const response = await createSingleConversation(userId.value, applicantId)
        if (response.code === 0 && response.data) {
          // 创建成功，构建本地会话对象
          const newConversation: Conversation = {
            id: response.data.id,
            conversationType: ConversationType.SINGLE,
            title: `与${applicantName}的会话`,
            createTime: new Date().toISOString(),
            unreadCount: 0
          }
          
          // 添加到会话列表
          conversations.value.push(newConversation)
          
          // 选中新创建的会话
          selectConversation(newConversation)
          
          // 重新加载会话列表
          loadConversations()
        } else {
          ElMessage.error(response.message || '创建会话失败')
        }
      } catch (error) {
        console.error('创建会话失败:', error)
        ElMessage.error('创建会话失败')
      }
    }
  }
}, { immediate: true })

// 加载用户会话列表
const loadConversations = async () => {
  if (!userId.value) {
    ElMessage.error('无法获取用户ID')
    return
  }
  
  loading.value = true
  try {
    // 从API获取会话列表
    const response = await getUserConversations(userId.value)
    if (response.code === 0 && Array.isArray(response.data)) {
      conversations.value = response.data
      
      // 如果有会话，默认选择第一个
      if (conversations.value.length > 0 && !currentConversation.value && !route.query.applicantId) {
        selectConversation(conversations.value[0])
      }
    } else {
      ElMessage.error(response.message || '获取会话列表失败')
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
    ElMessage.error('加载会话列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 加载会话列表
  loadConversations()
  
  // 注册WebSocket事件
  registerSocketEvents()
})

onBeforeUnmount(() => {
  // 清理工作
  const socket = getSocket()
  if (socket) {
    socket.off('receive_message')
    socket.off('typing')
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 120px);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.chat-header h3 {
  margin: 0 0 10px 0;
}

.chat-list {
  flex: 1;
  overflow: hidden;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item.active {
  background-color: #ecf5ff;
}

.chat-info {
  margin-left: 12px;
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.chat-position {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.chat-last-message {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #909399;
  align-self: flex-start;
  margin-top: 4px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-main-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info h3 {
  margin: 0;
}

.position {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.message-date {
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  color: #909399;
}

.message-item {
  margin-bottom: 16px;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.message-self .message-content {
  flex-direction: row-reverse;
}

.message-bubble {
  margin: 0 12px;
  max-width: 70%;
}

.message-self .message-bubble {
  background-color: #409eff;
  color: white;
  border-radius: 16px 0 16px 16px;
}

.message-bubble:not(.message-self .message-bubble) {
  background-color: #fff;
  border-radius: 0 16px 16px 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.message-text {
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
  text-align: right;
  padding: 0 8px 4px 0;
}

.message-self .message-time {
  color: #a0cfff;
}

.message-status {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin: 8px 0;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.chat-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
}
</style> 