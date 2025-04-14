import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { MessageBoxData } from 'element-plus'

// 消息提示类型
type MessageType = 'success' | 'warning' | 'info' | 'error'

// 消息配置接口
interface MessageOptions {
  message: string
  title?: string
  duration?: number
  showClose?: boolean
  center?: boolean
  dangerouslyUseHTMLString?: boolean
  offset?: number
}

/**
 * 消息提示
 * @param options 消息配置或消息内容
 * @param type 消息类型: success, warning, info, error
 */
const message = (options: MessageOptions | string, type: MessageType = 'info') => {
  if (typeof options === 'string') {
    ElMessage({
      message: options,
      type,
      duration: 2500
    })
  } else {
    ElMessage({
      message: options.message,
      type,
      duration: options.duration || 2500,
      showClose: options.showClose,
      center: options.center,
      dangerouslyUseHTMLString: options.dangerouslyUseHTMLString,
      offset: options.offset
    })
  }
}

/**
 * 成功消息
 * @param options 消息配置或消息内容
 */
const success = (options: MessageOptions | string) => {
  message(options, 'success')
}

/**
 * 警告消息
 * @param options 消息配置或消息内容
 */
const warning = (options: MessageOptions | string) => {
  message(options, 'warning')
}

/**
 * 信息消息
 * @param options 消息配置或消息内容
 */
const info = (options: MessageOptions | string) => {
  message(options, 'info')
}

/**
 * 错误消息
 * @param options 消息配置或消息内容
 */
const error = (options: MessageOptions | string) => {
  message(options, 'error')
}

/**
 * 通知
 * @param options 通知配置或消息内容
 * @param type 通知类型: success, warning, info, error
 */
const notify = (options: MessageOptions | string, type: MessageType = 'info') => {
  if (typeof options === 'string') {
    ElNotification({
      message: options,
      type,
      duration: 4500,
      title: '系统通知'
    })
  } else {
    ElNotification({
      title: options.title || '系统通知',
      message: options.message,
      type,
      duration: options.duration || 4500,
      showClose: options.showClose === undefined ? true : options.showClose,
      dangerouslyUseHTMLString: options.dangerouslyUseHTMLString
    })
  }
}

/**
 * 确认对话框
 * @param options 配置项或消息内容
 * @param title 标题
 * @param type 类型: success, warning, info, error
 * @returns Promise
 */
const confirm = (
  options: MessageOptions | string,
  title: string = '确认操作',
  type: MessageType = 'warning'
): Promise<MessageBoxData> => {
  const message = typeof options === 'string' ? options : options.message
  
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type,
    draggable: true
  })
}

// 导出所有方法
export default {
  message,
  success,
  warning,
  info,
  error,
  notify,
  confirm
}
