import { get } from '@/utils/request'

/**
 * 首页看板模块 API 接口
 */

/**
 * 获取系统管理员看板数据
 * @returns Promise
 */
export const getAdminDashboardData = () => {
  return get('/dashboard/admin-overview')
}

/**
 * 获取企业管理员看板数据
 * @returns Promise
 */
export const getCompanyAdminDashboardData = () => {
  return get('/dashboard/company-overview')
}

/**
 * 获取项目经理看板数据
 * @returns Promise
 */
export const getProjectManagerDashboardData = () => {
  return get('/dashboard/project-manager-overview')
}

/**
 * 获取待办事项列表
 * @param params 查询参数
 * @returns Promise
 */
export const getTodoList = (params: any) => {
  return get('/dashboard/todo-list', params)
}

/**
 * 根据用户角色获取相应的看板数据
 * @param userType 用户类型: admin/company-admin/project-manager
 * @returns Promise
 */
export const getDashboardDataByRole = (userType: string) => {
  switch (userType) {
    case 'admin':
      return getAdminDashboardData()
    case 'company':
      return getCompanyAdminDashboardData()
    case 'manager':
      return getProjectManagerDashboardData()
    default:
      throw new Error('未知的用户类型')
  }
} 