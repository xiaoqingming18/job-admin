import { get, post, put, del } from '@/utils/request'
import type { ContractTemplate, ContractTemplateDetail } from '@/types/contractTemplate'

/**
 * 合同模板模块 API 接口
 */

/**
 * 创建合同模板
 * @param data 合同模板信息
 */
export const createContractTemplate = (data: {
  name: string
  content: string
  variables: Array<{ name: string; description: string }>
}) => {
  return post<{ id: number; name: string; status: string; createTime: string }>('/contract-templates', data)
}

/**
 * 获取合同模板列表
 * @param params 查询参数
 */
export const getContractTemplates = (params?: { status?: 'active' | 'inactive' }) => {
  return get<ContractTemplate[]>('/contract-templates', params)
}

/**
 * 获取合同模板详情
 * @param id 模板ID
 */
export const getContractTemplateDetail = (id: number) => {
  return get<ContractTemplateDetail>(`/contract-templates/${id}`)
}

/**
 * 更新合同模板
 * @param id 模板ID
 * @param data 更新数据
 */
export const updateContractTemplate = (
  id: number,
  data: {
    name: string
    content: string
    variables: Array<{ name: string; description: string }>
    status: 'active' | 'inactive'
  }
) => {
  return put<{ id: number; name: string; status: string; updateTime: string }>(
    `/contract-templates/${id}`,
    data
  )
}

/**
 * 删除合同模板
 * @param id 模板ID
 */
export const deleteContractTemplate = (id: number) => {
  return del<boolean>(`/contract-templates/${id}`)
} 