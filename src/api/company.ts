import { get, post, put, del } from '@/utils/request'
import type { CompanyInfoResponse, CompanyInfo, ProjectManagerListResponse, AddProjectManagerParams, CompanyAdminVO, CompanyListResponse } from '@/types/company'
import type { PageResult } from '@/types/common'

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
  return get<CompanyInfoResponse>(`/company/info/${id}`)
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
 * 获取企业项目经理列表
 * @param companyId 企业ID
 * @returns 项目经理列表
 */
export const getCompanyManagerList = (companyId: number) => {
  return get<ProjectManagerListResponse>(`/company/project-managers/${companyId}`)
}

/**
 * 添加项目经理
 * @param params 添加项目经理参数
 * @returns 操作结果
 */
export const addProjectManager = (params: AddProjectManagerParams) => {
  return post('/company/add-project-manager', params)
}

/**
 * 删除项目经理
 * @param managerId 项目经理ID
 * @returns 操作结果
 */
export const deleteProjectManager = (managerId: number) => {
  return post(`/company/manager/${managerId}/delete`)
}

/**
 * 获取用户所属企业信息
 * @returns 企业信息
 */
export function getUserCompanyInfo() {
  return get<CompanyInfoResponse>('/user/company-info')
}

/**
 * 获取企业列表（分页）- 系统管理员使用
 * @param params 查询参数
 * @returns 企业列表
 */
export function getAdminCompanyList(params: {
  keyword?: string
  status?: string
  industry?: string
  pageNum?: number
  pageSize?: number
}) {
  return post<CompanyListResponse>('/admin/companies/list', params)
}

/**
 * 获取企业详情 - 系统管理员使用
 * @param id 企业ID
 * @returns 企业详情
 */
export function getAdminCompanyDetail(id: number) {
  return get<{ code: number, message: string, data: CompanyAdminVO }>(`/admin/companies/${id}`)
}

/**
 * 更新企业状态 - 系统管理员使用
 * @param data 更新参数
 * @returns 操作结果
 */
export function updateCompanyStatus(data: { id: number, status: string }) {
  return put('/admin/companies/status', data)
}

/**
 * 更新企业信息（企业管理员使用）
 * @param data 企业信息
 * @returns 操作结果
 */
export function updateCompanyInfo(data: Partial<CompanyInfo>) {
  return put('/company/update', data)
}

/**
 * 获取行业列表
 * @returns 行业列表
 */
export function getIndustryList() {
  return get('/common/industries')
}

/**
 * 获取企业规模列表
 * @returns 企业规模列表
 */
export function getCompanySizeList() {
  return get('/common/company-sizes')
}
