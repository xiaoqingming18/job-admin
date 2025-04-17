import { get, post, put, del } from '@/utils/request'
import type { 
  CreateLaborDemandParams,
  LaborDemandDetail,
  UpdateLaborDemandParamsNew,
  UpdateLaborDemandStatusParamsNew,
  LaborDemandResponse
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