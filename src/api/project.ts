import { get, post, put } from '@/utils/request'
import type { CompanyProjectListParams, CompanyProjectListResponse } from '@/types/project'

/**
 * 项目模块 API 接口
 */

/**
 * 添加项目
 * @param data 项目信息
 */
export const addProject = (data: {
  companyId: number
  name: string
  address: string
  startDate: string
  expectedEndDate: string
  projectType: string
  projectScale: string
  totalArea: number
  budget: number
  description: string
}) => {
  return post('/project/add', data)
}

/**
 * 获取项目详情
 * @param id 项目ID
 */
export const getProjectInfo = (id: number) => {
  return get(`/project/info/${id}`)
}

/**
 * 更新项目信息
 * @param data 项目信息
 */
export const updateProject = (data: {
  id: number
  name?: string
  address?: string
  startDate?: string
  expectedEndDate?: string
  budget?: number
  description?: string
}) => {
  return put('/project/update', data)
}

/**
 * 更新项目状态
 * @param data 项目状态
 */
export const updateProjectStatus = (data: {
  id: number
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled'
}) => {
  return put('/project/status', data)
}

/**
 * 获取项目列表
 * @param params 查询参数
 * @returns Promise
 */
export const getProjectList = (params: {
  current?: number
  size?: number
  name?: string
  companyId?: number
  status?: string
  projectType?: string
  startDateBegin?: string
  startDateEnd?: string
}) => {
  return post('/project/list', params)
}

/**
 * 删除项目
 * @param id 项目ID
 * @returns Promise
 */
export const deleteProject = (id: number) => {
  return get(`/project/delete/${id}`)
}

/**
 * 获取企业项目列表
 * @param params 查询参数
 * @returns Promise<CompanyProjectListResponse>
 */
export function getCompanyProjectList(params: CompanyProjectListParams): Promise<CompanyProjectListResponse> {
  const { companyId, pageNum, pageSize } = params
  return get<CompanyProjectListResponse>(`/project/company/${companyId}/list`, { pageNum, pageSize })
}
