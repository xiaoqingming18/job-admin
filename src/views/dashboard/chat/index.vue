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
                {{ conversation.title ? conversation.title.charAt(0) : '?' }}
              </el-avatar>
            </el-badge>
            <div class="chat-info">
              <div class="chat-name">{{ conversation.title }}</div>
              <div class="chat-position">{{ conversation.position }}</div>
              <div class="chat-last-message">{{ formatLastMessage(conversation.lastMessage) }}</div>
            </div>
            <div class="chat-time">{{ formatLastMessageTime(conversation.lastMessage) }}</div>
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
                  :src="message.sender?.avatar || currentConversation.avatar || defaultAvatar"
                >
                  {{ ((message.sender?.username || currentConversation?.title) || '?').charAt(0) }}
                </el-avatar>
                
                <div class="message-bubble">
                  <!-- 文本消息 -->
                  <div class="message-text" v-if="message.messageType === 'text'">{{ message.content }}</div>
                  
                  <!-- 图片消息 -->
                  <div class="message-image" v-else-if="message.messageType === 'image'">
                    <el-image 
                      :src="message.mediaUrl" 
                      :preview-src-list="[message.mediaUrl]"
                      fit="cover"
                      :initial-index="0"
                      class="message-img"
                    />
                  </div>

                  <!-- 文件消息 -->
                  <div class="message-file" v-else-if="message.messageType === 'file'">
                    <a :href="message.mediaUrl" target="_blank">
                      <el-icon><Document /></el-icon>
                      {{ message.fileName || '未命名文件' }}
                      <span v-if="message.fileSize">({{ formatFileSize(message.fileSize) }})</span>
                    </a>
                  </div>

                  <div class="message-footer">
                    <span class="message-time">{{ formatMessageTime(message.sendTime) }}</span>
                    <span v-if="message.isSelf" class="message-status">
                      <el-icon v-if="message.status === 'sending'" class="is-loading"><Loading /></el-icon>
                      <span v-if="message.status === 'sending'" class="status-text">发送中</span>
                      
                      <el-icon v-else-if="message.status === 'sent'" color="#67C23A"><CircleCheck /></el-icon>
                      <span v-if="message.status === 'sent'" class="status-text">已发送</span>
                      
                      <el-icon v-else-if="message.status === 'delivered'" color="#67C23A"><CircleCheck /></el-icon>
                      <span v-if="message.status === 'delivered'" class="status-text">已送达</span>
                      
                      <el-icon v-else-if="message.status === 'read'" color="#67C23A"><CircleCheck /></el-icon>
                      <span v-if="message.status === 'read'" class="status-text">已读</span>
                      
                      <el-icon v-else-if="message.status === 'failed'" color="#F56C6C"><CircleClose /></el-icon>
                      <span v-if="message.status === 'failed'" class="status-text">发送失败</span>
                      
                      <el-button 
                        v-if="message.status === 'failed'" 
                        size="small" 
                        type="text" 
                        @click="resendMessage(message)"
                      >
                        重试
                      </el-button>
                    </span>
                  </div>
                </div>
                
                <el-avatar 
                  v-if="message.isSelf" 
                  :size="36" 
                  :src="userAvatar || defaultAvatar"
                >
                  {{ userName?.charAt(0) || '?' }}
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
          <div class="preview-area" v-if="imagePreview">
            <div class="image-preview">
              <el-image :src="imagePreview" fit="cover" class="preview-img" />
              <el-button type="danger" circle size="small" class="remove-preview" @click="removeImagePreview">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="input-actions">
            <el-upload
              class="upload-image"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleImageSelect"
            >
              <el-button type="text">
                <el-icon><Picture /></el-icon>
              </el-button>
            </el-upload>
            <el-button type="primary" @click="sendMessage" :disabled="!canSendMessage">
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
import { Search, Loading, CircleCheck, CircleClose, Document, Picture, Close } from '@element-plus/icons-vue'
import { formatDate, formatTimeAgo } from '@/utils/format'
import { getSocket } from '@/utils/socket'
import { getUserConversations, getConversationDetail, createSingleConversation, sendTextMessage, sendImageMessage, sendFileMessage, sendMediaMessage } from '@/api/im'
import { getUserId } from '@/utils/auth'
import type { Conversation, Message, ChatMessages, UserInfo } from '@/types/im'
import { ConversationType, MessageType, MessageStatus } from '@/types/im'
import { createTempMessage, updateMessage, addMessage, findMessageIndex } from '@/utils/messageHelper'
import { upload } from '@/api/file'
import type { UploadFile } from 'element-plus'

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

// 图片预览
const imagePreview = ref('')
const selectedImage = ref<File | null>(null)

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

// 处理图片上传
const uploading = ref(false)

// 是否可以发送消息
const canSendMessage = computed(() => {
  return messageContent.value.trim() !== '' || imagePreview.value !== ''
})

// 根据搜索关键词过滤会话
const filteredConversations = computed(() => {
  if (!searchKeyword.value) {
    return conversations.value
  }
  return conversations.value.filter(conversation => 
    conversation.title && conversation.title.includes(searchKeyword.value)
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
        const lastMessage = {
          ...conversation.lastMessage,
          isSelf: conversation.lastMessage.senderId === userId.value,
          status: conversation.lastMessage.status || MessageStatus.SENT
        }
        mockMessages.push(lastMessage)
      }
      
      // 使用解构方式更新，确保响应式更新
      chatMessages[conversationId] = [...mockMessages]
      
      console.log('加载消息完成:', chatMessages[conversationId])
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

// 处理图片选择
const handleImageSelect = (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error('文件加载失败')
    return
  }

  // 验证文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  // 验证文件大小（2MB）
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return
  }

  // 保存选择的图片文件
  selectedImage.value = file.raw
  
  // 生成预览
  imagePreview.value = URL.createObjectURL(file.raw)
}

// 移除图片预览
const removeImagePreview = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = ''
    selectedImage.value = null
  }
}

// 发送消息
const sendMessage = async () => {
  if (!canSendMessage.value || !currentConversation.value) return
  
  const conversationId = currentConversation.value.id
  
  // 如果有图片，发送图片消息
  if (selectedImage.value) {
    await sendImageMessageWithUpload()
    return
  }
  
  // 否则发送文本消息
  if (messageContent.value.trim()) {
    // 创建临时消息对象
    const tempMessage = createTempMessage(
      userId.value,
      conversationId,
      messageContent.value
    )
    
    // 确保消息数组已初始化
    if (!chatMessages[conversationId]) {
      chatMessages[conversationId] = []
    }
    
    // 添加临时消息到聊天记录
    chatMessages[conversationId] = addMessage(chatMessages[conversationId], tempMessage)
    
    console.log('添加消息后长度:', chatMessages[conversationId].length, chatMessages[conversationId])
    
    // 更新最近消息
    if (currentConversation.value) {
      currentConversation.value.lastMessage = {...tempMessage}
    }
    
    // 滚动到最新消息
    nextTick(() => {
      scrollToBottom()
    })
    
    // 清空输入框
    const messageToSend = messageContent.value
    messageContent.value = ''
    
    try {
      // 调用API发送消息
      const response = await sendTextMessage(
        conversationId,
        userId.value,
        messageToSend
      )
      
      console.log('发送消息响应:', response)
      
      if (response.code === 0 && response.data) {
        // 找到临时消息的索引
        const messageIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id)
        
        console.log('找到临时消息索引:', messageIndex)
        
        if (messageIndex !== -1) {
          // 使用服务器返回的数据更新临时消息
          const serverMessage = response.data
          
          // 通过工具函数更新消息，确保响应式
          chatMessages[conversationId] = updateMessage(
            chatMessages[conversationId],
            messageIndex,
            {
              ...serverMessage,
              isSelf: true,
              status: MessageStatus.SENT
            }
          )
          
          console.log('更新后的消息:', chatMessages[conversationId][messageIndex])
          
          // 更新最近消息
          if (currentConversation.value) {
            currentConversation.value.lastMessage = {...chatMessages[conversationId][messageIndex]}
          }
        }
      } else {
        throw new Error(response.message || '发送消息失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      ElMessage.error('发送消息失败，请重试')
      
      // 将消息状态更新为发送失败
      const messageIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id)
      
      if (messageIndex !== -1) {
        // 使用工具函数更新消息状态
        chatMessages[conversationId] = updateMessage(
          chatMessages[conversationId],
          messageIndex,
          { status: MessageStatus.FAILED }
        )
      }
      
      // 获取Socket实例尝试通过Socket发送
      const socket = getSocket()
      if (socket) {
        socket.emit('send_message', {
          conversationId,
          content: messageToSend
        })
      }
    }
  }
}

// 发送图片消息（包括上传）
const sendImageMessageWithUpload = async () => {
  if (!selectedImage.value || !currentConversation.value) return
  
  const conversationId = currentConversation.value.id
  const imageFile = selectedImage.value
  
  // 创建临时消息对象 - 图片消息
  const tempMessage = createTempMessage(
    userId.value,
    conversationId,
    '',
    MessageType.IMAGE
  )
  
  // 清空预览
  removeImagePreview()
  
  // 确保消息数组已初始化
  if (!chatMessages[conversationId]) {
    chatMessages[conversationId] = []
  }
  
  // 添加临时消息到聊天记录
  chatMessages[conversationId] = addMessage(chatMessages[conversationId], tempMessage)
  
  // 更新最近消息
  if (currentConversation.value) {
    currentConversation.value.lastMessage = {...tempMessage}
  }
  
  // 滚动到最新消息
  nextTick(() => {
    scrollToBottom()
  })
  
  uploading.value = true
  try {
    // 上传图片
    const res = await upload(imageFile, 'chat-images')
    if (res.code === 0 && res.data) {
      // 更新临时消息的mediaUrl
      const updatedIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id)
      if (updatedIndex !== -1) {
        chatMessages[conversationId] = updateMessage(
          chatMessages[conversationId],
          updatedIndex,
          { 
            mediaUrl: res.data.url,
            status: MessageStatus.SENT
          }
        )
      }
      
      // 发送媒体消息到服务器
      const response = await sendMediaMessage(
        conversationId, 
        userId.value, 
        res.data.url,
        MessageType.IMAGE
      )
      if (response.code === 0 && response.data) {
        // 更新临时消息的ID和状态
        const updatedIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id)
        if (updatedIndex !== -1) {
          chatMessages[conversationId] = updateMessage(
            chatMessages[conversationId],
            updatedIndex,
            { 
              id: response.data.id,
              status: MessageStatus.DELIVERED
            }
          )
        }
        
        // 更新最近消息
        if (currentConversation.value) {
          currentConversation.value.lastMessage = {
            ...chatMessages[conversationId][updatedIndex]
          }
        }
      } else {
        throw new Error(response.message || '发送图片消息失败')
      }
    } else {
      throw new Error(res.message || '图片上传失败')
    }
  } catch (error: any) {
    console.error('图片上传或发送失败', error)
    ElMessage.error(error.message || '图片上传失败，请稍后再试')
    
    // 更新临时消息状态为失败
    const updatedIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id)
    if (updatedIndex !== -1) {
      chatMessages[conversationId] = updateMessage(
        chatMessages[conversationId],
        updatedIndex,
        { status: MessageStatus.FAILED }
      )
    }
  } finally {
    uploading.value = false
  }
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
  
  // 接收新消息 - 监听原有事件
  socket.on('receive_message', handleNewMessage)
  
  // 接收新消息 - 监听标准im:message事件
  socket.on('im:message', handleNewMessage)
  
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

// 处理新消息的函数
const handleNewMessage = (data) => {
  const { conversationId, senderId, content, messageId, sendTime, messageType = MessageType.TEXT } = data
  
  console.log('收到新消息:', data)
  
  // 查找对应会话
  let conversation = conversations.value.find(c => c.id === conversationId)
  
  // 如果未找到对应会话，创建一个新会话
  if (!conversation) {
    console.warn('未找到对应的会话，创建新会话:', conversationId)
    
    // 创建一个新的会话对象
    const newConversation: Conversation = {
      id: conversationId,
      conversationType: ConversationType.SINGLE,
      title: data.senderName || `会话 ${conversationId}`,
      createTime: new Date().toISOString(),
      unreadCount: 1,
      avatar: data.senderAvatar || '',
      position: data.senderPosition || ''
    };
    
    // 添加到会话列表
    conversations.value.push(newConversation);
    conversation = newConversation;
  }
  
  // 创建新消息
  const newMessage: Message = {
    id: messageId || Date.now(),
    conversationId,
    senderId,
    messageType: messageType,
    content: content || '',
    sendTime: sendTime || new Date().toISOString(),
    status: MessageStatus.DELIVERED,
    isSelf: senderId === userId.value
  }
  
  // 如果是文件或图片消息，添加特定属性
  if (messageType === MessageType.FILE && data.fileName) {
    newMessage.fileName = data.fileName
    newMessage.fileSize = data.fileSize
    newMessage.mediaUrl = data.mediaUrl
  } else if (messageType === MessageType.IMAGE && data.mediaUrl) {
    newMessage.mediaUrl = data.mediaUrl
  }
  
  // 如果没有该会话的聊天记录，初始化一个
  if (!chatMessages[conversationId]) {
    chatMessages[conversationId] = []
  }
  
  // 使用工具函数添加消息，确保响应式更新
  chatMessages[conversationId] = addMessage(chatMessages[conversationId], newMessage)
  
  // 更新会话的最后一条消息
  conversation.lastMessage = {...newMessage}
  
  // 如果不是当前选中的会话，增加未读消息数
  if (!currentConversation.value || currentConversation.value.id !== conversationId) {
    conversation.unreadCount = (conversation.unreadCount || 0) + 1
    
    // 将有新消息的会话移到列表顶部
    moveConversationToTop(conversation)
  } else {
    // 当前正在查看该会话，滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
  
  // 新消息提示
  ElMessage({
    message: `收到新消息: ${formatLastMessage(newMessage)}`,
    type: 'success'
  })
}

// 将会话移动到列表顶部
const moveConversationToTop = (conversation: Conversation) => {
  // 找到会话索引
  const index = conversations.value.findIndex(c => c.id === conversation.id)
  if (index > 0) { // 只有不在顶部时才需要移动
    conversations.value.splice(index, 1) // 移除当前位置
    conversations.value.unshift(conversation) // 添加到顶部
  }
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
      // 确保每个会话对象都有默认值，避免空对象
      conversations.value = response.data.map(conversation => ({
        id: conversation.id || 0,
        conversationType: conversation.conversationType || ConversationType.SINGLE,
        title: conversation.title || '未命名会话',
        avatar: conversation.avatar || '',
        lastMessage: conversation.lastMessage || undefined,
        createTime: conversation.createTime || new Date().toISOString(),
        unreadCount: conversation.unreadCount || 0,
        position: conversation.position || ''
      }));
      
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

// 重发消息
const resendMessage = async (message: Message) => {
  // 获取会话ID
  const conversationId = currentConversation.value!.id
  
  // 找到消息索引
  const messageIndex = findMessageIndex(chatMessages[conversationId], message.id)
  
  if (messageIndex !== -1) {
    // 先将消息状态更新为"发送中"
    chatMessages[conversationId] = updateMessage(
      chatMessages[conversationId],
      messageIndex,
      { status: MessageStatus.SENDING }
    )
  }
  
  try {
    // 调用API重新发送消息
    const response = await sendTextMessage(
      message.conversationId || conversationId,
      userId.value,
      message.content
    )
    
    if (response.code === 0 && response.data) {
      // 找到消息索引（可能已经变化）
      const updatedIndex = findMessageIndex(chatMessages[conversationId], message.id)
      
      if (updatedIndex !== -1) {
        // 使用服务器返回的消息数据更新
        const serverMessage = response.data
        
        // 使用工具函数更新消息，确保响应式
        chatMessages[conversationId] = updateMessage(
          chatMessages[conversationId],
          updatedIndex,
          {
            ...serverMessage,
            isSelf: true,
            status: MessageStatus.SENT
          }
        )
        
        // 更新最近消息
        if (currentConversation.value && 
            currentConversation.value.lastMessage && 
            currentConversation.value.lastMessage.id === message.id) {
          currentConversation.value.lastMessage = {...chatMessages[conversationId][updatedIndex]}
        }
      }
    } else {
      throw new Error(response.message || '发送消息失败')
    }
  } catch (error) {
    console.error('重发消息失败:', error)
    ElMessage.error('重发消息失败，请重试')
    
    const updatedIndex = findMessageIndex(chatMessages[conversationId], message.id)
    if (updatedIndex !== -1) {
      // 使用工具函数更新消息状态为失败
      chatMessages[conversationId] = updateMessage(
        chatMessages[conversationId],
        updatedIndex,
        { status: MessageStatus.FAILED }
      )
    }
  }
}

// 格式化最后一条消息显示
const formatLastMessage = (lastMessage: Message | undefined): string => {
  if (!lastMessage) return '暂无消息';
  if (typeof lastMessage === 'string') return lastMessage;
  
  // 根据消息类型格式化
  switch (lastMessage.messageType) {
    case MessageType.TEXT:
      return lastMessage.content || '文本消息';
    case MessageType.IMAGE:
      return '[图片]';
    case MessageType.FILE:
      return `[文件] ${lastMessage.fileName || ''}`;
    case MessageType.SYSTEM:
      return '[系统通知]';
    default:
      return lastMessage.content || '暂无消息';
  }
}

// 格式化最后一条消息的时间
const formatLastMessageTime = (lastMessage: Message | undefined): string => {
  if (!lastMessage || !lastMessage.sendTime) return '';
  return formatTimeAgo(lastMessage.sendTime);
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB';
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + 'MB';
  } else {
    return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB';
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
    socket.off('im:message') // 移除im:message事件监听
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
  padding: 10px 12px;
}

.message-self .message-bubble {
  background-color: #409eff;
  color: white;
  border-radius: 16px 0 16px 16px;
}

.message-self .message-bubble a,
.message-self .message-bubble .el-icon {
  color: white;
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

.message-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 8px 4px 0;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-right: 4px;
}

.message-status {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.status-text {
  margin: 0 4px;
  color: #a0cfff;
}

.message-self .message-time {
  color: #a0cfff;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.upload-image {
  margin-right: 10px;
}

.el-upload {
  display: inline-block;
}

.chat-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
}

.message-image {
  margin-bottom: 4px;
}

.message-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  object-fit: contain;
}

.message-file {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.message-file a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  word-break: break-word;
}

.message-file i {
  margin-right: 8px;
}

.preview-area {
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  background-color: #f9fafc;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
}

.remove-preview {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0.8;
}
</style>
