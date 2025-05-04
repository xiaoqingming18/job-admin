import type { App } from 'vue'
import { initSocket, disconnectSocket, getSocket } from '../utils/socket'
import router from '../router'

// 全局状态，用于跟踪Socket连接状态
let isSocketInitialized = false

export default {
  install(app: App) {
    console.log('Socket插件安装中...')
    
    // 初始化Socket的函数
    const initSocketConnection = () => {
      // 如果已经初始化过，则不重复初始化
      if (isSocketInitialized) {
        console.log('Socket已经初始化，跳过')
        return
      }
      
      // 获取存储的token
      const token = localStorage.getItem('token')
      
      if (token) {
        console.log('发现token，初始化Socket连接')
        initSocket(token)
        isSocketInitialized = true
      } else {
        console.log('未找到token，跳过Socket初始化')
      }
    }
    
    // 应用加载时尝试初始化一次
    initSocketConnection()
    
    // 断开Socket连接的函数
    const closeSocketConnection = () => {
      console.log('正在断开Socket连接')
      disconnectSocket()
      isSocketInitialized = false
    }
    
    // 重置Socket连接状态(用于登出时)
    app.config.globalProperties.$resetSocketState = () => {
      isSocketInitialized = false
    }
    
    // 在页面关闭或刷新时断开连接
    window.addEventListener('beforeunload', closeSocketConnection)
    
    // 不在路由守卫中进行Socket初始化，避免每次路由跳转都尝试初始化
  }
} 