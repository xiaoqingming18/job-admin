import { get, post } from '@/utils/request'

/**
 * 生成工资单
 * @param data 工资生成参数
 */
export function generateSalary(data: {
  projectId: number
  year: number
  month: number
}) {
  return post<number>('/salary/generate', data)
}

/**
 * 获取工资详情
 * @param id 工资单ID
 */
export function getSalaryDetail(id: number) {
  return get(`/salary/${id}`)
}

/**
 * 确认工资单
 * @param id 工资单ID
 */
export function confirmSalary(id: number) {
  return post<boolean>(`/salary/confirm/${id}`)
}

/**
 * 标记工资已发放
 * @param id 工资单ID
 */
export function paySalary(id: number) {
  return post<boolean>(`/salary/pay/${id}`)
}

/**
 * 批量确认工资单
 * @param ids 工资单ID列表
 */
export function batchConfirmSalary(ids: number[]) {
  return post<number>('/salary/batch-confirm', ids)
}

/**
 * 批量标记工资已发放
 * @param ids 工资单ID列表
 */
export function batchPaySalary(ids: number[]) {
  return post<number>('/salary/batch-pay', ids)
}

/**
 * 获取工资列表
 * @param params 查询参数
 */
export function getSalaryList(params: {
  current?: number
  size?: number
  projectId?: number
  year?: number
  month?: number
  status?: string
  userName?: string
  attendanceCode?: string
}) {
  return get('/salary/list', params)
}

/**
 * 工资单状态映射
 */
export const salaryStatusMap = {
  pending: '待确认',
  confirmed: '已确认',
  paid: '已发放'
}

/**
 * 工资单状态标签类型映射
 */
export const salaryStatusTypeMap = {
  pending: 'warning',
  confirmed: 'success',
  paid: 'info'
} 