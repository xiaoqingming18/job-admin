import { get, post, put } from '@/utils/request'

/**
 * 企业模块 API 接口
 */

/**
 * 注册新企业及管理员
 * @param data 企业及管理员信息
 */
export const registerCompany = (data: {
  name: string
  licenseNumber: string
  address: string
  legalPerson: string
  username: string
  password: string
  email: string
  position: string
}) => {
  return post('/company/register', data)
}

/**
 * 获取企业信息
 * @param id 企业ID
 */
export const getCompanyInfo = (id: number | string) => {
  return get(`/company/info/${id}`)
}

/**
 * 更新企业信息
 * @param data 企业信息
 */
export const updateCompany = (data: {
  id: number
  name?: string
  address?: string
  legalPerson?: string
}) => {
  return put('/company/update', data)
}

/**
 * 添加项目经理
 * @param data 项目经理信息
 */
export const addProjectManager = (data: {
  companyId: number
  username: string
  password: string
  email: string
  position: string
}) => {
  return post('/company/add-project-manager', data)
}
