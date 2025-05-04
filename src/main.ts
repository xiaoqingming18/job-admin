import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import elementPlugin from './plugins/element'
import socketPlugin from './plugins/socket'

// Import Element Plus styles
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/message-box/style/css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(elementPlugin)
app.use(socketPlugin)

// 将app实例挂载到全局
declare global {
  interface Window {
    vueApp: any;
  }
}

// 为调试目的暴露Vue应用实例
window.vueApp = app;

app.mount('#app')
