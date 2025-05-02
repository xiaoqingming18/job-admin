import type { App } from 'vue'
import { initSocket, disconnectSocket } from '../utils/socket'

export default {
  install(app: App) {
    // 获取存储的 token
    const token = localStorage.getItem('token')
    
    // 如果有 token，建立 WebSocket 连接
    if (token) {
      initSocket(token)
    }
    
    // 在页面关闭或刷新时断开连接
    window.addEventListener('beforeunload', () => {
      disconnectSocket()
    })
  }
} 