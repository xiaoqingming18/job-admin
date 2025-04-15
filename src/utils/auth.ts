import { ElMessage } from 'element-plus'

/**
 * 检查用户是否为系统管理员
 * @returns 是否为系统管理员
 */
export const isAdmin = (): boolean => {
  return localStorage.getItem('userType') === 'admin'
}

/**
 * 检查用户是否为企业管理员
 * @returns 是否为企业管理员
 */
export const isCompanyAdmin = (): boolean => {
  return localStorage.getItem('userType') === 'company'
}

/**
 * 检查用户是否为项目经理
 * @returns 是否为项目经理
 */
export const isProjectManager = (): boolean => {
  return localStorage.getItem('userType') === 'manager'
}

/**
 * 获取当前用户类型
 * @returns 用户类型：admin/company/manager
 */
export const getUserType = (): string => {
  return localStorage.getItem('userType') || ''
}

/**
 * 检查用户是否有权限访问特定页面
 * @param requireAdmin 是否需要管理员权限
 * @param showMessage 是否显示错误消息
 * @returns 是否有权限
 */
export const checkPermission = (requireAdmin = false, showMessage = true): boolean => {
  // 如果需要管理员权限，检查用户类型
  if (requireAdmin && !isAdmin()) {
    if (showMessage) {
      ElMessage.error('您没有权限访问该页面')
    }
    return false
  }
  return true
}

/**
 * 清除用户信息
 */
export const clearUserInfo = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('userType')
} 