import { get, post, put } from '@/utils/request'
import type { 
  LaborContract, 
  LaborContractDetail,
  GenerateLaborContractRequest,
  UpdateLaborContractStatusRequest
} from '@/types/laborContract'

/**
 * 劳务合同模块 API 接口
 */

/**
 * 生成劳务合同
 * @param data 生成劳务合同的参数
 */
export const generateLaborContract = (data: GenerateLaborContractRequest) => {
  return post<LaborContract>('/labor-contracts/generate', data)
}

/**
 * 获取劳务合同列表
 * @param params 查询参数
 */
export const getLaborContracts = (params?: {
  companyId?: number
  projectId?: number
  status?: 'active' | 'terminated' | 'expired'
}) => {
  return get<LaborContract[]>('/labor-contracts', params)
}

/**
 * 获取劳务合同详情
 * @param id 合同ID
 */
export const getLaborContractDetail = (id: number) => {
  return get<LaborContractDetail>(`/labor-contracts/${id}`)
}

/**
 * 更新劳务合同状态
 * @param id 合同ID
 * @param data 状态更新参数
 */
export const updateLaborContractStatus = (id: number, data: UpdateLaborContractStatusRequest) => {
  return put<{
    id: number
    contractCode: string
    status: string
    terminationReason: string | null
    updateTime: string
  }>(`/labor-contracts/${id}/status`, data)
} 