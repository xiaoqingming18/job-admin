import { get } from '@/utils/request'

/**
 * 首页看板模块 API 接口
 */

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
 * 根据用户角色获取相应的看板数据
 * @param userType 用户类型: admin/company-admin/project-manager
 * @returns Promise
 */
export const getDashboardDataByRole = (userType: string) => {
  switch (userType) {
    case 'admin':
      // 系统管理员使用模拟数据
      return Promise.resolve({
        code: 0,
        data: {
          totalCompanies: 256,
          totalProjects: 145,
          totalJobs: 432,
          totalUsers: 1240
        }
      })
    case 'company':
      return getCompanyAdminDashboardData()
    case 'manager':
      return getProjectManagerDashboardData()
    default:
      throw new Error('未知的用户类型')
  }
} 