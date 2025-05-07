import { get, post } from '@/utils/request'

/**
 * 用户模块 API 接口
 */

/**
 * 管理员登录
 * @param data 用户名和密码
 */
export const adminLogin = (data: { username: string; password: string }) => {
  return post('/user/admin-login', data)
}

/**
 * 求职者登录
 * @param data 用户名和密码
 */
export const jobseekerLogin = (data: { username: string; password: string }) => {
  return post('/user/jobseeker-login', data)
}

/**
 * 企业管理员登录
 * @param data 用户名和密码
 */
export const companyAdminLogin = (data: { username: string; password: string }) => {
  return post('/user/company-admin-login', data)
}

/**
 * 项目经理登录
 * @param data 用户名和密码
 */
export const projectManagerLogin = (data: { username: string; password: string }) => {
  return post('/user/project-manager-login', data)
}

/**
 * 求职者注册
 * @param data 注册信息
 */
export const jobseekerRegister = (data: { username: string; password: string; email: string }) => {
  return post('/user/jobseeker-register', data)
}

/**
 * 更新求职者个人信息
 * @param data 个人信息
 */
export const updateJobseekerInfo = (data: {
  mobile?: string
  email?: string
  avatar?: string
  realName?: string
  gender?: string
  birthday?: string
  expectPosition?: string
  workYears?: number
  skill?: string
  certificates?: string
  resumeUrl?: string
}) => {
  return post('/user/jobseeker-update-info', data)
}

/**
 * 获取求职者个人资料
 */
export const getJobseekerProfile = () => {
  return get('/user/jobseeker-profile')
}

/**
 * 修改求职者密码
 * @param data 密码信息
 */
export const updateJobseekerPassword = (data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) => {
  return post('/user/jobseeker-update-password', data)
}

/**
 * 验证令牌有效性
 */
export const verifyToken = () => {
  return get('/user/verify-token')
}

/**
 * 获取用户详细信息
 * @param userId 用户ID
 */
export const getUserDetail = (userId: number) => {
  return get(`/user/detail/${userId}`)
}

/**
 * 搜索用户
 * @param query 搜索关键词（用户名、手机号或邮箱）
 * @returns 用户列表
 */
export const searchUsers = (query: string) => {
  return get('/user/search', { query })
}

/**
 * 模糊搜索求职者
 * @param keyword 搜索关键词（用户名或真实姓名）
 * @returns 求职者列表
 */
export const searchJobseekers = (keyword: string) => {
  return get<{
    code: number;
    data: Array<{
      id: number;
      username: string;
      realName: string | null;
    }>;
    message: string;
  }>('/user/search-jobseekers', { keyword })
}
