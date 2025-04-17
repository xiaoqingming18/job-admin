import { get, post, put } from '@/utils/request'
import type { 
  LaborDemandQueryParams, 
  LaborDemandListResponse, 
  LaborDemandDetailResponse,
  ProjectLaborDemandListResponse,
  CompanyLaborDemandListResponse,
  AddLaborDemandParams,
  UpdateLaborDemandParams,
  UpdateLaborDemandStatusParams
} from '@/types/labor'

/**
 * 劳务需求管理 API 接口
 */

/**
 * 获取劳务需求列表（分页）
 * @param params 查询参数
 * @returns Promise<LaborDemandListResponse>
 */
export function getLaborDemandList(params: LaborDemandQueryParams): Promise<LaborDemandListResponse> {
  return get<LaborDemandListResponse>('/labor-demand/page', params)
}

/**
 * 获取劳务需求详情
 * @param id 劳务需求ID
 * @returns Promise<LaborDemandDetailResponse>
 */
export function getLaborDemandInfo(id: number): Promise<LaborDemandDetailResponse> {
  return get<LaborDemandDetailResponse>(`/labor-demand/info/${id}`)
}

/**
 * 添加劳务需求
 * @param params 添加劳务需求参数
 * @returns Promise
 */
export function addLaborDemand(params: AddLaborDemandParams) {
  return post('/labor-demand/add', params)
}

/**
 * 更新劳务需求
 * @param params 更新劳务需求参数
 * @returns Promise
 */
export function updateLaborDemand(params: UpdateLaborDemandParams) {
  return put('/labor-demand/update', params)
}

/**
 * 更新劳务需求状态
 * @param params 更新劳务需求状态参数
 * @returns Promise
 */
export function updateLaborDemandStatus(params: UpdateLaborDemandStatusParams) {
  return put('/labor-demand/status', params)
}

/**
 * 删除劳务需求
 * @param id 劳务需求ID
 * @returns Promise
 */
export function deleteLaborDemand(id: number) {
  return get(`/labor-demand/delete/${id}`)
}

/**
 * 获取企业的劳务需求列表
 * @param companyId 企业ID
 * @returns Promise<CompanyLaborDemandListResponse>
 */
export function getCompanyLaborDemandList(companyId: number): Promise<CompanyLaborDemandListResponse> {
  return get<CompanyLaborDemandListResponse>(`/labor-demand/company/${companyId}/list`)
}

/**
 * 获取项目的劳务需求列表
 * @param projectId 项目ID
 * @returns Promise<ProjectLaborDemandListResponse>
 */
export function getProjectLaborDemandList(projectId: number): Promise<ProjectLaborDemandListResponse> {
  return get<ProjectLaborDemandListResponse>(`/labor-demand/project/${projectId}/list`)
}

/**
 * 审批劳务需求
 * @param id 劳务需求ID
 * @param approved 是否批准 (true: 批准, false: 拒绝)
 * @param rejectReason 拒绝原因（如果拒绝）
 * @returns Promise
 */
export function approveLaborDemand(id: number, approved: boolean, rejectReason?: string) {
  return post('/labor-demand/approve', { id, approved, rejectReason })
}

/**
 * 搜索劳务需求
 * @param params 查询参数
 * @returns Promise<LaborDemandListResponse>
 */
export function searchLaborDemand(params: LaborDemandQueryParams): Promise<LaborDemandListResponse> {
  return post<LaborDemandListResponse>('/labor-demand/search', params)
} 