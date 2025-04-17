import { get, post, put, del } from '@/utils/request'
import type { 
  CreateLaborDemandParams,
  LaborDemandDetail,
  UpdateLaborDemandParamsNew,
  UpdateLaborDemandStatusParamsNew,
  LaborDemandResponse,
  LaborDemandPageQueryParams,
  LaborDemandPageResponse,
  LaborDemandListResponseNew,
  LaborDemandSearchParams
} from '@/types/labor'

/**
 * 劳务需求管理 API 接口（新版）
 */

/**
 * 创建劳务需求
 * @param params 创建劳务需求参数
 * @returns Promise<LaborDemandResponse<LaborDemandDetail>>
 */
export function createLaborDemand(params: CreateLaborDemandParams): Promise<LaborDemandResponse<LaborDemandDetail>> {
  return post<LaborDemandResponse<LaborDemandDetail>>('/labor-demand/create', params)
}

/**
 * 获取劳务需求详情
 * @param id 劳务需求ID
 * @returns Promise<LaborDemandResponse<LaborDemandDetail>>
 */
export function getLaborDemandById(id: number): Promise<LaborDemandResponse<LaborDemandDetail>> {
  return get<LaborDemandResponse<LaborDemandDetail>>(`/labor-demand/${id}`)
}

/**
 * 更新劳务需求
 * @param params 更新劳务需求参数
 * @returns Promise<LaborDemandResponse<LaborDemandDetail>>
 */
export function updateLaborDemandInfo(params: UpdateLaborDemandParamsNew): Promise<LaborDemandResponse<LaborDemandDetail>> {
  return put<LaborDemandResponse<LaborDemandDetail>>('/labor-demand/update', params)
}

/**
 * 删除劳务需求
 * @param id 劳务需求ID
 * @returns Promise<LaborDemandResponse<boolean>>
 */
export function removeLaborDemand(id: number): Promise<LaborDemandResponse<boolean>> {
  return del<LaborDemandResponse<boolean>>(`/labor-demand/delete/${id}`)
}

/**
 * 更新劳务需求状态
 * @param params 更新状态参数
 * @returns Promise<LaborDemandResponse<LaborDemandDetail>>
 */
export function changeLaborDemandStatus(params: UpdateLaborDemandStatusParamsNew): Promise<LaborDemandResponse<LaborDemandDetail>> {
  return put<LaborDemandResponse<LaborDemandDetail>>('/labor-demand/status', params)
}

/**
 * 分页查询劳务需求
 * @param params 查询参数
 * @returns Promise<LaborDemandPageResponse>
 */
export function getLaborDemandPage(params: LaborDemandPageQueryParams): Promise<LaborDemandPageResponse> {
  return post<LaborDemandPageResponse>('/labor-demand/list', params)
}

/**
 * 查询项目下的所有劳务需求
 * @param projectId 项目ID
 * @returns Promise<LaborDemandListResponseNew>
 */
export function getLaborDemandsByProject(projectId: number): Promise<LaborDemandListResponseNew> {
  return get<LaborDemandListResponseNew>(`/labor-demand/by-project/${projectId}`)
}

/**
 * 搜索劳务需求
 * @param params 搜索参数
 * @returns Promise<LaborDemandPageResponse>
 */
export function searchLaborDemands(params: LaborDemandSearchParams): Promise<LaborDemandPageResponse> {
  return get<LaborDemandPageResponse>('/labor-demand/search', params)
}

/**
 * 获取热门/推荐劳务需求
 * @param limit 返回数量，默认10
 * @returns Promise<LaborDemandListResponseNew>
 */
export function getRecommendedLaborDemands(limit: number = 10): Promise<LaborDemandListResponseNew> {
  return get<LaborDemandListResponseNew>('/labor-demand/recommended', { limit })
} 