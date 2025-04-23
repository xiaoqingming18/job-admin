import { get, post, put } from '@/utils/request'
import type { CommonResponse, PageResponse } from '@/types/common'
import type { JobApplication, JobApplicationDetail, Interview, InterviewReview } from '@/types/jobApplication'
import axios from 'axios'

/**
 * 分页查询求职申请列表
 * @param params 查询参数
 * @returns 申请列表
 */
export function getJobApplicationList(params: {
  page?: number
  size?: number
  projectId?: number
  demandId?: number
  status?: string
  jobSeekerName?: string
}) {
  // 适配后端参数名称
  const apiParams = {
    pageNum: params.page,
    pageSize: params.size,
    projectId: params.projectId,
    demandId: params.demandId,
    status: params.status,
    jobSeekerName: params.jobSeekerName
  }
  
  // 使用封装的post方法
  return post('/job-application/list', apiParams)
}

/**
 * 获取申请详情
 * @param id 申请ID
 * @returns 申请详情
 */
export function getJobApplicationDetail(id: number) {
  return get<CommonResponse<JobApplicationDetail>>(`/job-application/detail/${id}`)
}

/**
 * 更新申请状态
 * @param params 状态更新参数
 * @returns 更新结果
 */
export function updateJobApplicationStatus(params: {
  id: number
  status: string
  rejectionReason?: string
}) {
  return put<CommonResponse<boolean>>('/job-application/update-status', params)
}

/**
 * 安排面试
 * @param params 面试安排参数
 * @returns 面试安排结果
 */
export function arrangeInterview(params: {
  applicationId: number
  interviewDate: string
  location: string
  interviewType: string
  remarks?: string
}) {
  return post<CommonResponse<Interview>>('/job-application/arrange-interview', params)
}

/**
 * 更新面试状态与结果
 * @param params 面试更新参数
 * @returns 更新结果
 */
export function updateInterview(params: {
  interviewId: number
  status: string
  result?: string
  resultComment?: string
}) {
  return put<CommonResponse<boolean>>('/job-application/update-interview', params)
}

/**
 * 项目经理提交面试评价
 * @param params 评价参数
 * @returns 提交结果
 */
export function submitManagerReview(params: {
  interviewId: number
  rating: number
  comment: string
}) {
  return post<CommonResponse<boolean>>('/job-application/manager-review', params)
}

/**
 * 获取面试评价列表
 * @param interviewId 面试ID
 * @returns 评价列表
 */
export function getInterviewReviews(interviewId: number) {
  return get<CommonResponse<InterviewReview[]>>(`/job-application/interview-reviews/${interviewId}`)
}

/**
 * 求职申请模块API
 */
export const jobApplicationApi = {
  getJobApplicationList,
  getJobApplicationDetail,
  updateJobApplicationStatus,
  arrangeInterview,
  updateInterview,
  submitManagerReview,
  getInterviewReviews
} 