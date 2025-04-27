/**
 * 合同模板类型定义
 */

/**
 * 合同模板变量接口
 */
export interface ContractTemplateVariable {
  name: string
  description: string
}

/**
 * 合同模板列表项接口
 */
export interface ContractTemplate {
  id: number
  name: string
  status: 'active' | 'inactive'
  createTime: string
}

/**
 * 合同模板详情接口
 */
export interface ContractTemplateDetail extends ContractTemplate {
  content: string
  variables: ContractTemplateVariable[]
}

/**
 * 创建合同模板请求接口
 */
export interface CreateContractTemplateRequest {
  name: string
  content: string
  variables: ContractTemplateVariable[]
}

/**
 * 更新合同模板请求接口
 */
export interface UpdateContractTemplateRequest {
  name: string
  content: string
  variables: ContractTemplateVariable[]
  status: 'active' | 'inactive'
} 