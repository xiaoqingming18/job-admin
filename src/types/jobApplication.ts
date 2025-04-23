/**
 * 求职申请基本信息
 */
export interface JobApplication {
  id: number
  jobSeekerId: number
  jobSeekerName: string
  demandId: number
  demandTitle: string
  expectedEntryDate: string
  expectedSalary: number
  status: string
  createTime: string
}

/**
 * 面试信息
 */
export interface Interview {
  id: number
  applicationId: number
  interviewDate: string
  location: string
  interviewType: string
  remarks?: string
  status: string
  result: string
  resultComment?: string
}

/**
 * 求职申请详情
 */
export interface JobApplicationDetail {
  id: number
  jobSeekerId: number
  jobSeekerName: string
  jobSeekerGender: string
  jobSeekerAge: number
  jobSeekerWorkYears: number
  jobSeekerSkill: string
  jobSeekerCertificates: string[]
  resumeUrl?: string
  demandId: number
  demandTitle: string
  projectId: number
  projectName: string
  selfIntroduction?: string
  expectedEntryDate: string
  expectedSalary: number
  status: string
  rejectionReason?: string
  createTime: string
  interviews: Interview[]
}

/**
 * 面试评价
 */
export interface InterviewReview {
  id: number
  reviewerId: number
  reviewerName: string
  reviewerType: string
  rating: number
  comment: string
  createTime: string
}

/**
 * 申请状态枚举
 */
export const ApplicationStatus = {
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  REJECTED: 'rejected',
  HIRED: 'hired',
  CANCELLED: 'cancelled'
}

/**
 * 申请状态中文映射
 */
export const ApplicationStatusMap = {
  [ApplicationStatus.APPLIED]: '已申请',
  [ApplicationStatus.INTERVIEWING]: '面试中',
  [ApplicationStatus.REJECTED]: '已拒绝',
  [ApplicationStatus.HIRED]: '已录用',
  [ApplicationStatus.CANCELLED]: '已取消'
}

/**
 * 面试类型枚举
 */
export const InterviewType = {
  ONSITE: 'onsite',
  PHONE: 'phone',
  VIDEO: 'video'
}

/**
 * 面试类型中文映射
 */
export const InterviewTypeMap = {
  [InterviewType.ONSITE]: '现场面试',
  [InterviewType.PHONE]: '电话面试',
  [InterviewType.VIDEO]: '视频面试'
}

/**
 * 面试状态枚举
 */
export const InterviewStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
}

/**
 * 面试状态中文映射
 */
export const InterviewStatusMap = {
  [InterviewStatus.SCHEDULED]: '已安排',
  [InterviewStatus.COMPLETED]: '已完成',
  [InterviewStatus.CANCELLED]: '已取消',
  [InterviewStatus.RESCHEDULED]: '已重新安排'
}

/**
 * 面试结果枚举
 */
export const InterviewResult = {
  PENDING: 'pending',
  PASS: 'pass',
  FAIL: 'fail'
}

/**
 * 面试结果中文映射
 */
export const InterviewResultMap = {
  [InterviewResult.PENDING]: '待定',
  [InterviewResult.PASS]: '通过',
  [InterviewResult.FAIL]: '未通过'
} 