/**
 * 劳务合同类型定义
 */

/**
 * 劳务合同列表项接口
 */
export interface LaborContract {
  id: number
  contractCode: string
  jobSeekerName: string
  projectName: string
  startDate: string
  endDate: string
  status: 'pending' | 'active' | 'terminated' | 'expired' | 'review'
}

/**
 * 劳务合同详情接口
 */
export interface LaborContractDetail extends LaborContract {
  templateName: string
  terminationReason: string | null
  renewalCount: number
  createTime: string
  updateTime: string
  submitTime?: string
  newStartDate?: string
  newEndDate?: string
  remarks?: string
}

/**
 * 生成劳务合同请求参数
 */
export interface GenerateLaborContractRequest {
  templateId: number
  projectId: number
  jobSeekerId: number
  startDate: string
  endDate: string
  variables: Record<string, string>
}

/**
 * 更新劳务合同状态请求参数
 */
export interface UpdateLaborContractStatusRequest {
  status: 'pending' | 'active' | 'terminated' | 'expired'
  terminationReason?: string
}

/**
 * 提交劳务合同签订响应
 */
export interface ContractSubmitResponse {
  id: number
  contractCode: string
  status: string
  submitTime: string
}

/**
 * 合同续约请求参数
 */
export interface ContractRenewalRequest {
  newStartDate: string
  newEndDate: string
  remarks: string
}

/**
 * 合同续约响应
 */
export interface ContractRenewalResponse {
  id: number
  contractCode: string
  status: string
  renewalCount: number
  newStartDate: string
  newEndDate: string
  submitTime: string
  remarks: string
} 