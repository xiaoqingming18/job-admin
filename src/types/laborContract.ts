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
  status: 'active' | 'terminated' | 'expired'
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
  status: 'active' | 'terminated' | 'expired'
  terminationReason?: string
} 