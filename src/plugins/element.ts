import type { App } from 'vue'
import icons from './icons'
import message from '../utils/message'

export default {
  install(app: App) {
    // 注册图标
    app.use(icons)
    
    // 全局属性
    app.config.globalProperties.$message = message
  }
}
