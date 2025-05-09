import { get, post } from '@/utils/request'
import type { PageResponse } from '@/types/common'
import type { 
  LeaveApplyRequest, 
  LeaveApprovalRequest, 
  LeaveCancelRequest, 
  LeaveQueryParams, 
  Leave,
  LeaveDetail,
  LeaveApprovalLog
} from '@/types/leave'

/**
 * 申请请假
 * @param data 请假申请数据
 */
export function applyLeave(data: LeaveApplyRequest) {
  return post<Leave>('/api/leave/apply', data)
}

/**
 * 项目经理审批请假
 * @param data 审批请求数据
 */
export function approveLeaveByManager(data: LeaveApprovalRequest) {
  return post<Leave>('/api/leave/approve/manager', data)
}

/**
 * 企业管理员审批请假
 * @param data 审批请求数据
 */
export function approveLeaveByAdmin(data: LeaveApprovalRequest) {
  return post<Leave>('/api/leave/approve/admin', data)
}

/**
 * 取消请假申请
 * @param data 取消请求数据
 */
export function cancelLeave(data: LeaveCancelRequest) {
  return post<boolean>('/api/leave/cancel', data)
}

/**
 * 获取请假详情
 * @param leaveId 请假记录ID
 */
export function getLeaveDetail(leaveId: number) {
  return get<LeaveDetail>(`/api/leave/${leaveId}`)
}

/**
 * 获取请假审批日志
 * @param leaveId 请假记录ID
 */
export function getLeaveApprovalLogs(leaveId: number) {
  return get<LeaveApprovalLog[]>(`/api/leave/${leaveId}/logs`)
}

/**
 * 获取所有请假审批记录
 * @param params 查询参数
 */
export function getAllLeaveApprovalLogs(params: any) {
  return get<PageResponse<LeaveApprovalLog>>('/api/leave/approval-logs', params)
}

/**
 * 获取我的请假列表
 * @param params 查询参数
 */
export function getMyLeaves(params: LeaveQueryParams) {
  return get<PageResponse<Leave>>('/api/leave/my-leaves', params)
}

/**
 * 获取项目请假列表
 * @param projectId 项目ID
 * @param params 查询参数
 */
export function getProjectLeaves(projectId: number, params: LeaveQueryParams) {
  return get<PageResponse<Leave>>(`/api/leave/project/${projectId}`, params)
}

/**
 * 获取企业请假列表
 * @param companyId 企业ID
 * @param params 查询参数
 */
export function getCompanyLeaves(companyId: number, params: LeaveQueryParams) {
  return get<PageResponse<Leave>>(`/api/leave/company/${companyId}`, params)
}

/**
 * 获取待我审批的请假列表
 * @param params 查询参数
 */
export function getPendingApprovalLeaves(params: LeaveQueryParams) {
  return get<PageResponse<Leave>>('/api/leave/pending-approval', params)
} 