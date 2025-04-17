import type { PageParams } from './common'

/**
 * 劳务需求状态枚举
 */
export enum LaborDemandStatus {
  Draft = 0,     // 草稿
  Pending = 1,   // 待审核
  Approved = 2,  // 已批准
  Rejected = 3,  // 已拒绝
  InProgress = 4, // 进行中
  Completed = 5, // 已完成
  Canceled = 6   // 已取消
}

/**
 * 劳务需求类型
 */
export interface LaborDemand {
  id: number
  projectId: number
  projectName: string
  companyId: number
  companyName: string
  title: string
  occupationId: number
  occupationName: string
  occupationCategoryId: number
  occupationCategoryName: string
  requiredCount: number
  startDate: string
  endDate: string
  dailyWage: number
  totalBudget: number
  description: string
  requirements: string
  contactPerson: string
  contactPhone: string
  status: LaborDemandStatus
  approvedBy?: number
  approvedByName?: string
  approvedTime?: string
  rejectReason?: string
  createdBy: number
  createdByName: string
  createTime: string
  updateTime?: string
}

/**
 * 劳务需求列表项
 */
export interface LaborDemandListItem {
  id: number
  projectId: number
  projectName: string
  companyId: number
  companyName: string
  title: string
  occupationId: number
  occupationName: string
  requiredCount: number
  startDate: string
  endDate: string
  dailyWage: number
  status: LaborDemandStatus
  createTime: string
}

/**
 * 劳务需求查询参数
 */
export interface LaborDemandQueryParams extends PageParams {
  keyword?: string
  companyId?: number
  projectId?: number
  occupationId?: number
  occupationCategoryId?: number
  status?: LaborDemandStatus
  startDateBegin?: string
  startDateEnd?: string
  endDateBegin?: string
  endDateEnd?: string
}

/**
 * 添加劳务需求参数
 */
export interface AddLaborDemandParams {
  projectId: number
  title: string
  occupationId: number
  requiredCount: number
  startDate: string
  endDate: string
  dailyWage: number
  description?: string
  requirements?: string
  contactPerson: string
  contactPhone: string
}

/**
 * 更新劳务需求参数
 */
export interface UpdateLaborDemandParams {
  id: number
  title?: string
  occupationId?: number
  requiredCount?: number
  startDate?: string
  endDate?: string
  dailyWage?: number
  description?: string
  requirements?: string
  contactPerson?: string
  contactPhone?: string
}

/**
 * 更新劳务需求状态参数
 */
export interface UpdateLaborDemandStatusParams {
  id: number
  status: LaborDemandStatus
  rejectReason?: string
}

/**
 * 劳务需求列表响应
 */
export interface LaborDemandListResponse {
  code: number
  data: {
    pageNum: number
    pageSize: number
    total: number
    totalPages: number
    list: LaborDemandListItem[]
  }
  message: string
}

/**
 * 劳务需求详情响应
 */
export interface LaborDemandDetailResponse {
  code: number
  data: LaborDemand
  message: string
}

/**
 * 项目劳务需求列表响应
 */
export interface ProjectLaborDemandListResponse {
  code: number
  data: LaborDemandListItem[]
  message: string
}

/**
 * 企业劳务需求列表响应
 */
export interface CompanyLaborDemandListResponse {
  code: number
  data: LaborDemandListItem[]
  message: string
} 