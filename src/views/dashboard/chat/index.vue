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

                  <!-- 视频消息 -->
                  <div class="message-video" v-else-if="message.messageType === 'video'">
                    <video 
                      controls
                      class="message-video-player"
                      :src="message.mediaUrl"
                      preload="metadata"
                    ></video>
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
          <div class="input-container">
            <el-input
              v-model="messageContent"
              type="textarea"
              :rows="imagePreview ? 2 : 3"
              placeholder="请输入消息..."
              resize="none"
              @keydown.enter.prevent="sendMessage"
              ref="messageInput"
            />
            <div class="preview-area" v-if="imagePreview">
              <div class="image-preview">
                <el-image :src="imagePreview" fit="cover" class="preview-img" />
                <el-button type="danger" circle size="small" class="remove-preview" @click="removeImagePreview">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div class="input-actions">
            <div class="action-buttons">
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
              <el-upload
                class="upload-video"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept="video/*"
                :on-change="handleVideoSelect"
              >
                <el-button type="text">
                  <el-icon><VideoCamera /></el-icon>
                </el-button>
              </el-upload>
            </div>
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
import { Search, Loading, CircleCheck, CircleClose, Document, Picture, Close, VideoCamera } from '@element-plus/icons-vue'
import { formatDate, formatTimeAgo } from '@/utils/format'
import { getSocket } from '@/utils/socket'
import { getConversationDetail, createSingleConversation, sendTextMessage, sendImageMessage, sendFileMessage, sendMediaMessage, getUserConversations } from '@/api/im'
import { useUserStore } from '@/stores/user'
import type { Conversation, Message, ChatMessages, UserInfo } from '@/types/im'
import { ConversationType, MessageType, MessageStatus } from '@/types/im'
import { createTempMessage, updateMessage, addMessage, findMessageIndex } from '@/utils/messageHelper'
import { upload } from '@/api/file'
import type { UploadFile } from 'element-plus'

// 默认头像
const defaultAvatar = new URL('@/assets/default-avatar.png', import.meta.url).href
// 视频占位图（Base64编码）
const videoPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDggNzkuMTY0MDM2LCAyMDE5LzA4LzEzLTAxOjA2OjU3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA1LTA1VDE1OjMwOjEwKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wNS0wNVQxNTozMjoxNyswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNS0wNVQxNTozMjoxNyswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjNzZmYmM1ZS1lNWE4LTRlNDktOWQ1OS1kZjhiNzk3ZTk0ZWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo0ZDMzODQxZS1lY2U1LTFiNDYtYjQwZi03MzQ1ZTc4NzE4OWIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiMGZhNDY3OS0zYTkyLTNmNGItODg0NC05NzVmZWUzZTJlOGUiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmIwZmE0Njc5LTNhOTItM2Y0Yi04ODQ0LTk3NWZlZTNlMmU4ZSIgc3RFdnQ6d2hlbj0iMjAyMy0wNS0wNVQxNTozMDoxMCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjNzZmYmM1ZS1lNWE4LTRlNDktOWQ1OS1kZjhiNzk3ZTk0ZWMiIHN0RXZ0OndoZW49IjIwMjMtMDUtMDVUMTU6MzI6MTcrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6dE0cNAAAQXklEQVR4nO2deZAdxXXGv+67s2lGo9FqtIxWBAiBAMEiEAgQO8YYjA3YYAdb2BgMtgGX7dgVVxynXKnEjp2kXKkklcofscs2tjEbxnixEAYbsARiMWAQQmhfZ9FoRjOaGc3MvO7+8kdP6/b09JvlvXlv5s35ql5pXr/u032/6dvdt8/pJhEBI4SXyiqsqKtrrgYAY8ymTLVZOVPbYxKmI187p2jLRwwOZhTAaIEFMGKwAEYMXWULUASJSERkInnuZSQQkSGiXP5eHAGMGCyAEYMF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'

// 路由
const router = useRouter()
const route = useRoute()

// 使用用户仓库获取用户信息
const userStore = useUserStore()

// 当前用户信息
const userName = ref(userStore.username || '管理员')
const userAvatar = ref(userStore.userInfo?.avatar || '')
const userId = ref(userStore.userId || 0)

// 搜索关键词
const searchKeyword = ref('')

// 消息输入内容
const messageContent = ref('')
const messageInput = ref()

// 图片预览
const imagePreview = ref('')
const selectedImage = ref<File | null>(null)
const mediaType = ref<'image' | 'video'>('image')

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

  // 验证文件大小（10MB）
  const isLt10M = file.raw.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return
  }

  // 清除之前选择的媒体
  removeImagePreview()
  
  // 保存选择的图片文件
  selectedImage.value = file.raw
  mediaType.value = 'image'
  
  // 生成预览
  imagePreview.value = URL.createObjectURL(file.raw)
  
  // 聚焦到文本输入框
  nextTick(() => {
    messageInput.value?.focus()
  })
}

// 处理视频选择
const handleVideoSelect = (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error('文件加载失败')
    return
  }

  // 验证文件类型
  const isVideo = file.raw.type.startsWith('video/')
  if (!isVideo) {
    ElMessage.error('只能上传视频文件！')
    return
  }

  // 验证文件大小（最大30MB，而不是50MB）
  const isLt30M = file.raw.size / 1024 / 1024 < 30
  if (!isLt30M) {
    ElMessage.error('视频大小不能超过 30MB！请压缩后再上传')
    return
  }

  // 清除之前选择的媒体
  removeImagePreview()
  
  // 保存选择的视频文件
  selectedImage.value = file.raw
  mediaType.value = 'video'
  
  // 生成预览（使用Base64编码的占位图）
  imagePreview.value = videoPlaceholder
  
  // 聚焦到文本输入框
  nextTick(() => {
    messageInput.value?.focus()
  })
}

// 移除媒体预览
const removeImagePreview = () => {
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = ''
  selectedImage.value = null
}

// 发送消息
const sendMessage = async () => {
  if (!currentConversation.value) return;
  
  // 获取当前会话ID
  const conversationId = currentConversation.value.id;
  
  // 获取当前用户ID（直接从仓库获取，确保最新）
  const currentUserId = userStore.userId;
  
  if (!currentUserId) {
    ElMessage.error('用户ID无效，请重新登录');
    return;
  }
  
  // 更新本地用户ID（以防有变化）
  if (userId.value !== currentUserId) {
    userId.value = currentUserId;
  }
  
  // 文本内容和媒体文件至少需要有一个
  if (!messageContent.value.trim() && !selectedImage.value) {
    return;
  }
  
  try {
    // 如果有选择的媒体文件，先上传
    if (selectedImage.value) {
      // 根据媒体类型调用对应的上传函数
      if (mediaType.value === 'image') {
        await sendImageMessageWithUpload();
      } else if (mediaType.value === 'video') {
        await sendVideoMessageWithUpload();
      }
    } else if (messageContent.value.trim()) {
      // 创建临时消息对象
      const tempMessage = createTempMessage(
        conversationId,
        currentUserId,
        messageContent.value.trim(),
        MessageType.TEXT
      );
      
      // 添加到当前会话的消息列表
      if (!chatMessages[conversationId]) {
        chatMessages[conversationId] = [];
      }
      
      chatMessages[conversationId] = addMessage(chatMessages[conversationId], tempMessage);
      
      // 立即滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
      
      // 向服务器发送消息
      const response = await sendTextMessage(
        conversationId,
        currentUserId,
        messageContent.value.trim()
      );
      
      // 如果发送成功，更新消息状态
      if (response.code === 0 && response.data) {
        // 查找临时消息的索引
        const messageIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id);
        
        if (messageIndex !== -1) {
          // 使用工具函数更新消息，确保响应式更新
          chatMessages[conversationId] = updateMessage(
            chatMessages[conversationId],
            messageIndex,
            {
              ...response.data,
              isSelf: true,
              status: MessageStatus.SENT
            }
          );
          
          // 更新当前会话的最后一条消息
          currentConversation.value.lastMessage = {...chatMessages[conversationId][messageIndex]};
        }
      } else {
        // 发送失败，标记消息状态为失败
        const messageIndex = findMessageIndex(chatMessages[conversationId], tempMessage.id);
        if (messageIndex !== -1) {
          chatMessages[conversationId] = updateMessage(
            chatMessages[conversationId],
            messageIndex,
            { status: MessageStatus.FAILED }
          );
        }
        
        throw new Error(response.message || '发送消息失败');
      }
    }
    
    // 清空输入框
    messageContent.value = '';
    
    // 清除媒体预览
    if (selectedImage.value) {
      removeImagePreview();
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  }
};

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

// 发送视频消息（包括上传）
const sendVideoMessageWithUpload = async () => {
  if (!selectedImage.value || !currentConversation.value) return
  
  const conversationId = currentConversation.value.id
  const videoFile = selectedImage.value
  
  // 创建临时消息对象 - 视频消息
  const tempMessage = createTempMessage(
    userId.value,
    conversationId,
    '',
    MessageType.VIDEO
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
  
  // 添加重试逻辑
  let retryCount = 0;
  const maxRetries = 3;
  
  const attemptUpload = async (): Promise<any> => {
    try {
      // 上传视频
      const res = await upload(videoFile, 'chat-videos')
      return res;
    } catch (error: any) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`视频上传失败，正在重试(${retryCount}/${maxRetries})...`);
        // 等待一段时间再重试
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptUpload();
      }
      throw error;
    }
  };
  
  try {
    // 使用重试逻辑上传视频
    const res = await attemptUpload();
    
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
        MessageType.VIDEO
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
        throw new Error(response.message || '发送视频消息失败')
      }
    } else {
      throw new Error(res.message || '视频上传失败')
    }
  } catch (error: any) {
    console.error('视频上传或发送失败', error)
    ElMessage.error(error.message || '视频上传失败，请稍后再试')
    
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
  if (!socket) {
    console.error('无法注册WebSocket事件：socket实例不存在')
    return
  }
  
  console.log('开始注册WebSocket事件监听...')
  
  // 移除旧的receive_message事件监听，因为IM系统只有im:message事件
  
  // 接收新消息 - 监听标准im:message事件
  socket.on('im:message', (data) => {
    console.log('聊天组件收到im:message事件:', data)
    // 适配消息数据
    const adaptedData = adaptMessageData(data)
    handleNewMessage(adaptedData)
  })
  
  // 对方正在输入
  socket.on('typing', (data) => {
    console.log('收到typing事件:', data)
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
  
  console.log('WebSocket事件监听已注册')
}

// 适配不同格式的消息数据
const adaptMessageData = (data: any) => {
  console.log('正在适配消息数据格式:', data)
  
  // 如果数据本身就是标准格式，直接返回
  if (data.conversationId && (data.senderId || data.senderId === 0) && (data.content !== undefined || data.messageType)) {
    return data
  }
  
  // 尝试从不同格式中提取数据
  const adaptedData: any = {}
  
  // 尝试提取会话ID
  adaptedData.conversationId = data.conversationId || data.conversation_id || data.convId || data.conv_id || 0
  
  // 尝试提取发送者ID
  adaptedData.senderId = data.senderId || data.sender_id || data.uid || data.userId || 0
  
  // 尝试提取消息内容
  adaptedData.content = data.content || data.text || data.message || ''
  
  // 尝试提取消息ID
  adaptedData.messageId = data.messageId || data.message_id || data.id || Date.now()
  
  // 尝试提取发送时间
  adaptedData.sendTime = data.sendTime || data.send_time || data.timestamp || new Date().toISOString()
  
  // 尝试提取消息类型
  adaptedData.messageType = data.messageType || data.message_type || MessageType.TEXT
  
  // 处理媒体URL
  if (data.mediaUrl || data.media_url || data.url) {
    adaptedData.mediaUrl = data.mediaUrl || data.media_url || data.url
  }
  
  // 处理文件信息
  if (data.fileName || data.file_name) {
    adaptedData.fileName = data.fileName || data.file_name
  }
  
  if (data.fileSize || data.file_size) {
    adaptedData.fileSize = data.fileSize || data.file_size
  }
  
  // 发送者信息
  adaptedData.senderName = data.senderName || data.sender_name || data.username || ''
  adaptedData.senderAvatar = data.senderAvatar || data.sender_avatar || data.avatar || ''
  adaptedData.senderPosition = data.senderPosition || data.sender_position || data.position || ''
  
  console.log('适配后的消息数据:', adaptedData)
  return adaptedData
}

// 处理新消息的函数
const handleNewMessage = (data) => {
  console.log('处理新消息，原始数据:', data)
  
  // 提取关键字段
  const { conversationId, senderId, content, messageId, sendTime, messageType = MessageType.TEXT } = data
  
  if (!conversationId) {
    console.error('消息缺少conversationId，无法处理:', data)
    return
  }
  
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
  } else if ((messageType === MessageType.IMAGE || messageType === MessageType.VIDEO) && data.mediaUrl) {
    newMessage.mediaUrl = data.mediaUrl
  }
  
  console.log('创建的新消息对象:', newMessage)
  
  // 如果没有该会话的聊天记录，初始化一个
  if (!chatMessages[conversationId]) {
    console.log('为会话创建新的消息数组:', conversationId)
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
  // 直接从用户仓库获取用户ID
  const currentUserId = userStore.userId;
  
  if (!currentUserId) {
    ElMessage.error('无法获取用户ID，请重新登录');
    return;
  }
  
  // 更新本地用户ID（以防有变化）
  userId.value = currentUserId;
  
  loading.value = true;
  try {
    // 从API获取会话列表
    const response = await getUserConversations(currentUserId);
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
        selectConversation(conversations.value[0]);
      }
    } else {
      ElMessage.error(response.message || '获取会话列表失败');
    }
  } catch (error) {
    console.error('加载会话列表失败:', error);
    ElMessage.error('加载会话列表失败');
  } finally {
    loading.value = false;
  }
};

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
    case MessageType.VIDEO:
      return '[视频]';
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
    // 移除receive_message的监听器
    socket.off('im:message') // 移除im:message事件监听
    socket.off('typing')
  }
})

// 监听用户信息变化
watch(() => userStore.userId, (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId) {
    console.log('用户ID已更新，重新加载会话列表:', newUserId);
    userId.value = newUserId;
    loadConversations();
  }
});
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

.input-container {
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.input-container:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

.input-container .el-textarea {
  border: none;
}

.input-container .el-textarea :deep(.el-textarea__inner) {
  border: none;
  resize: none;
  padding: 10px;
  box-shadow: none;
}

.preview-area {
  padding: 8px;
  background-color: #f9fafc;
  border-top: 1px solid #ebeef5;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-img {
  max-width: 150px;
  max-height: 100px;
  border-radius: 4px;
  display: block;
}

.remove-preview {
  position: absolute;
  top: 2px;
  right: 2px;
  opacity: 0.8;
  transform: scale(0.8);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  margin-right: 10px;
}

.upload-image {
  margin-right: 10px;
}

.upload-video {
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

.message-video {
  margin-bottom: 4px;
}

.message-video-player {
  max-width: 100%;
  max-height: 250px;
  border-radius: 8px;
  background-color: #000;
}
</style>
