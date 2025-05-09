/**
 * 请假查询参数
 */
export interface LeaveQueryParams {
  page?: number
  size?: number
  projectId?: number
  memberId?: number
  leaveType?: string
  status?: string
  startDate?: string
  endDate?: string
}

/**
 * 请假申请请求
 */
export interface LeaveApplyRequest {
  projectId: number
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
}

/**
 * 请假审批请求
 */
export interface LeaveApprovalRequest {
  leaveId: number
  action: string // approve-批准, reject-拒绝
  comments?: string
}

/**
 * 请假取消请求
 */
export interface LeaveCancelRequest {
  leaveId: number
}

/**
 * 请假记录
 */
export interface Leave {
  id: number
  memberId: number
  projectId: number
  projectName: string
  companyId: number
  companyName: string
  userId: number
  userName: string
  leaveType: string
  leaveTypeDesc: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  applicationTime: string
  status: string
  statusDesc: string
  updateTime: string
}

/**
 * 请假详情
 */
export interface LeaveDetail extends Leave {
  pmApproverId?: number
  pmApproverName?: string
  pmApprovalTime?: string
  pmApprovalStatus?: string
  pmApprovalStatusDesc?: string
  pmApprovalComments?: string
  adminApproverId?: number
  adminApproverName?: string
  adminApprovalTime?: string
  adminApprovalStatus?: string
  adminApprovalStatusDesc?: string
  adminApprovalComments?: string
}

/**
 * 请假审批日志
 */
export interface LeaveApprovalLog {
  id: number
  leaveId: number
  approverId: number
  approverName: string
  approverRole: string
  approverRoleDesc: string
  action: string
  actionDesc: string
  comments?: string
  actionTime: string
}

/**
 * 请假类型选项
 */
export const leaveTypeOptions = {
  sick: '病假',
  personal: '事假',
  annual: '年假',
  other: '其他'
}

/**
 * 请假状态选项
 */
export const leaveStatusOptions = {
  pending: '待审批',
  first_approved: '一级审批通过',
  approved: '全部审批通过',
  rejected: '已拒绝',
  cancelled: '已取消'
}

/**
 * 审批动作选项
 */
export const approvalActionOptions = {
  approve: '批准',
  reject: '拒绝'
} 