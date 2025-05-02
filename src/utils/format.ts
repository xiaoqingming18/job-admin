/**
 * 日期格式化
 * @param date 日期对象或字符串或时间戳
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date)
  
  // 如果日期无效，返回空字符串
  if (isNaN(d.getTime())) {
    return ''
  }
  
  // 获取年、月、日、时、分、秒
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()
  
  // 格式化映射
  const map: Record<string, number> = {
    'YYYY': year,
    'MM': month,
    'DD': day,
    'HH': hour,
    'mm': minute,
    'ss': second
  }
  
  // 替换格式化模板中的占位符
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => {
    const value = map[match]
    // 月、日、时、分、秒补零
    return match !== 'YYYY' && value < 10 ? `0${value}` : `${value}`
  })
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号
 * @param decimals 小数位数
 * @returns 格式化后的货币
 */
export const formatCurrency = (amount: number, currency: string = '¥', decimals: number = 2): string => {
  return currency + amount.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

/**
 * 友好的时间显示
 * @param date 日期
 * @returns 友好的时间显示
 */
export const formatTimeAgo = (date: Date | string | number): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return formatDate(date, 'YYYY-MM-DD')
  }
} 