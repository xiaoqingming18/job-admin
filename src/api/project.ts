import { get, post, put } from '@/utils/request'
import type { CompanyProjectListParams, CompanyProjectListResponse, ProjectListParams, ProjectListResponse, ManagerProjectListResponse } from '@/types/project'

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
  projectManagerId: number
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
  projectManagerId?: number
  projectType?: string
  projectScale?: string
  totalArea?: number
  status?: string
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

/**
 * 获取所有项目列表（分页）
 * @param params 查询参数
 * @returns Promise<ProjectListResponse>
 */
export function getProjectList(params: ProjectListParams): Promise<ProjectListResponse> {
  return get<ProjectListResponse>('/project/page', params)
}

/**
 * 获取项目经理管理的项目列表
 * @param managerId 项目经理ID
 * @returns Promise<ManagerProjectListResponse>
 */
export function getManagerProjectList(managerId: number): Promise<ManagerProjectListResponse> {
  return get<ManagerProjectListResponse>(`/project/manager/${managerId}`)
}

/**
 * 获取企业下的所有项目列表（直接获取，不带分页参数）
 * @param companyId 企业ID
 * @returns Promise
 */
export const getCompanyAllProjects = (companyId: number) => {
  return get<CompanyProjectListResponse>(`/project/company/${companyId}/list`)
}

/**
 * 获取项目考勤设置
 * @param projectId 项目ID
 * @returns Promise<项目考勤设置>
 */
export function getProjectAttendanceSetting(projectId: number) {
  return get(`/api/project/attendance/setting/${projectId}`)
}

/**
 * 设置项目考勤时间和加班费
 * @param data 考勤设置数据
 * @returns Promise<设置后的考勤信息>
 */
export function setProjectAttendanceSetting(data: {
  projectId: number
  checkInTime: string
  checkOutTime: string
  overtimePayRate?: number
}) {
  return post('/api/project/attendance/setting', data)
}
