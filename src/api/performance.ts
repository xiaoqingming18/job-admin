// 项目成员绩效评估相关API
import { get, post, put, del } from '@/utils/request'
import type {
  MemberPerformance,
  PerformanceAddParams,
  PerformanceUpdateParams,
  PerformanceQueryParams,
  PerformancePageResult
} from '@/types/performance'

/**
 * 添加绩效评估
 * @param data 添加绩效评估参数
 */
export function addPerformance(data: PerformanceAddParams) {
  return post<MemberPerformance>('/api/performance/add', data)
}

/**
 * 更新绩效评估
 * @param data 更新绩效评估参数
 */
export function updatePerformance(data: PerformanceUpdateParams) {
  return put<MemberPerformance>('/api/performance/update', data)
}

/**
 * 删除绩效评估
 * @param id 绩效评估ID
 */
export function deletePerformance(id: number) {
  return del<boolean>(`/api/performance/delete/${id}`)
}

/**
 * 获取绩效评估详情
 * @param id 绩效评估ID
 */
export function getPerformanceInfo(id: number) {
  return get<MemberPerformance>(`/api/performance/info/${id}`)
}

/**
 * 分页查询绩效评估
 * @param data 查询参数
 */
export function getPerformancePage(data: PerformanceQueryParams) {
  return post<PerformancePageResult>('/api/performance/page', data)
}

/**
 * 获取成员的绩效评估记录列表
 * @param memberId 成员ID
 */
export function getMemberPerformanceList(memberId: number) {
  return get<MemberPerformance[]>(`/api/performance/list/member/${memberId}`)
}

/**
 * 获取项目某评估周期的所有评估记录
 * @param projectId 项目ID
 * @param period 评估周期
 */
export function getProjectPeriodPerformance(projectId: number, period: string) {
  return get<MemberPerformance[]>(`/api/performance/list/project/${projectId}/${period}`)
}

/**
 * 检查是否有绩效评估权限
 * @param projectId 项目ID
 */
export function checkPerformancePermission(projectId: number) {
  return get<boolean>(`/api/performance/check-permission/${projectId}`)
} 