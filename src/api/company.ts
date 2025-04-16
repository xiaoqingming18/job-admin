import { get, post, put, del } from '@/utils/request'
import request from '@/utils/request'
import type { CompanyInfoResponse } from '@/types/company'

/**
 * 企业模块 API 接口
 */

/**
 * 注册新企业及管理员
 * @param data 企业和管理员信息
 * @returns Promise
 */
export const registerCompany = (data: any) => {
  return post('/company/register', data)
}

/**
 * 获取企业信息
 * @param id 企业ID
 * @returns Promise
 */
export const getCompanyInfo = (id: number) => {
  return get(`/company/info/${id}`)
}

/**
 * 更新企业信息
 * @param data 企业信息
 * @returns Promise
 */
export const updateCompany = (data: any) => {
  return put('/company/update', data)
}

/**
 * 获取企业列表
 * @param params 查询参数
 * @returns Promise
 */
export const getCompanyList = (params: any) => {
  return post('/company/list', params)
}

/**
 * 删除企业
 * @param id 企业ID
 * @returns Promise
 */
export const deleteCompany = (id: number) => {
  return del(`/company/delete/${id}`)
}

/**
 * 添加企业
 * @param data 企业信息
 * @returns Promise
 */
export const addCompany = (data: any) => {
  return post('/company/add', data)
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

// 获取用户所属企业信息
export function getUserCompanyInfo() {
  return get<CompanyInfoResponse>('/user/company-info')
}
