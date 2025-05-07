import { get, post, put } from '@/utils/request'
import type {
  ProjectMember,
  AddProjectMemberParams,
  UpdateProjectMemberParams,
  UpdateMemberStatusParams,
  ProjectMemberQueryParams,
  ProjectMemberPageResult
} from '@/types/projectMember'

/**
 * 项目成员模块 API 接口
 */

/**
 * 添加项目成员
 * @param data 成员信息
 * @returns Promise
 */
export const addProjectMember = (data: AddProjectMemberParams) => {
  return post<ProjectMember>('/project/member/add', data)
}

/**
 * 更新项目成员信息
 * @param data 成员信息
 * @returns Promise
 */
export const updateProjectMember = (data: UpdateProjectMemberParams) => {
  return put<ProjectMember>('/project/member/update', data)
}

/**
 * 更新项目成员状态
 * @param data 状态信息
 * @returns Promise
 */
export const updateProjectMemberStatus = (data: UpdateMemberStatusParams) => {
  return put<ProjectMember>('/project/member/status', data)
}

/**
 * 删除项目成员
 * @param id 成员ID
 * @returns Promise
 */
export const deleteProjectMember = (id: number) => {
  return get<string>(`/project/member/delete/${id}`)
}

/**
 * 获取项目成员详情
 * @param id 成员ID
 * @returns Promise
 */
export const getProjectMemberInfo = (id: number) => {
  return get<ProjectMember>(`/project/member/info/${id}`)
}

/**
 * 分页查询项目成员
 * @param params 查询参数
 * @returns Promise
 */
export const getProjectMemberPage = (params: ProjectMemberQueryParams) => {
  return get<ProjectMemberPageResult>('/project/member/page', params)
}

/**
 * 获取项目成员列表
 * @param projectId 项目ID
 * @returns Promise
 */
export const getProjectMemberList = (projectId: number) => {
  return get<ProjectMember[]>(`/project/member/list/${projectId}`)
}

/**
 * 获取用户参与的项目列表
 * @param userId 用户ID
 * @returns Promise
 */
export const getUserProjectList = (userId: number) => {
  return get<ProjectMember[]>(`/project/member/user/${userId}`)
}

/**
 * 检查用户是否为项目成员
 * @param projectId 项目ID
 * @param userId 用户ID
 * @returns Promise
 */
export const checkProjectMember = (projectId: number, userId: number) => {
  return get<boolean>('/project/member/check', { projectId, userId })
}

/**
 * 获取特定项目成员
 * @param projectId 项目ID
 * @param userId 用户ID
 * @returns Promise
 */
export const getProjectMember = (projectId: number, userId: number) => {
  return get<ProjectMember>('/project/member/info', { projectId, userId })
} 