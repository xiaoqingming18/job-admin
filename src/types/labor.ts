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
 * 劳务需求状态（字符串枚举，用于新API）
 */
export enum LaborDemandStatusString {
  Open = 'open',         // 开放中
  Filled = 'filled',     // 已满
  Cancelled = 'cancelled', // 已取消
  Expired = 'expired'    // 已过期
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
  status?: string | LaborDemandStatus
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
  title: string
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

/**
 * 创建劳务需求参数（新API）
 */
export interface CreateLaborDemandParams {
  title: string
  projectId: number
  jobTypeId: number
  headcount: number
  dailyWage: number
  startDate: string
  endDate: string
  workHours: string
  requirements?: string
  accommodation: boolean
  meals: boolean
}

/**
 * 劳务需求详情（新API）
 */
export interface LaborDemandDetail {
  id: number
  title: string
  projectId: number
  projectName: string
  projectAddress?: string
  jobTypeId: number
  jobTypeName: string
  jobTypeCategory?: string
  headcount: number
  dailyWage: number
  startDate: string
  endDate: string
  workHours: string
  requirements?: string
  accommodation: boolean
  meals: boolean
  status: string
  createTime: string
  updateTime?: string
  companyName?: string
}

/**
 * 更新劳务需求参数（新API）
 */
export interface UpdateLaborDemandParamsNew {
  id: number
  headcount?: number
  dailyWage?: number
  startDate?: string
  endDate?: string
  workHours?: string
  requirements?: string
  accommodation?: boolean
  meals?: boolean
}

/**
 * 更新劳务需求状态参数（新API）
 */
export interface UpdateLaborDemandStatusParamsNew {
  id: number
  status: string
}

/**
 * 通用响应类型（新API）
 */
export interface LaborDemandResponse<T = any> {
  code: number
  data: T
  message: string
}

/**
 * 劳务需求列表项（新查询API）
 */
export interface LaborDemandListItemNew {
  id: number
  title: string
  projectId: number
  projectName: string
  projectAddress?: string
  jobTypeId: number
  jobTypeName: string
  jobTypeCategory?: string
  headcount: number
  dailyWage: number
  startDate: string
  endDate: string
  workHours: string
  requirements?: string
  accommodation: boolean
  meals: boolean
  status: string
  createTime: string
  updateTime?: string
  companyName?: string
}

/**
 * 劳务需求分页查询参数
 */
export interface LaborDemandPageQueryParams {
  page: number
  size: number
  projectId?: number
  jobTypeId?: number
  status?: string
  minDailyWage?: number
  maxDailyWage?: number
  startDate?: string
  endDate?: string
  accommodation?: boolean
  meals?: boolean
}

/**
 * 劳务需求分页查询响应
 */
export interface LaborDemandPageResponse {
  code: number
  message: string
  data: {
    records: LaborDemandListItemNew[]
    total: number
    size: number
    current: number
    pages: number
  }
}

/**
 * 劳务需求列表响应
 */
export interface LaborDemandListResponseNew {
  code: number
  message: string
  data: LaborDemandListItemNew[]
}

/**
 * 劳务需求搜索参数
 */
export interface LaborDemandSearchParams {
  keyword?: string
  province?: string
  city?: string
  district?: string
  minDailyWage?: number
  maxDailyWage?: number
  startDateFrom?: string
  startDateTo?: string
  page?: number
  size?: number
}

/**
 * 更新劳务需求状态参数
 */
export interface LaborDemandStatusUpdateParams {
  id: number
  status: string
}

/**
 * 项目劳务需求统计信息
 */
export interface LaborDemandStatsByProject {
  totalDemandCount: number
  totalHeadcount: number
  openDemandCount: number
  filledDemandCount: number
  totalCost: number
  occupationDistribution: {
    occupationId: number
    occupationName: string
    count: number
    totalWage: number
  }[]
}

/**
 * 公司劳务需求统计信息
 */
export interface LaborDemandStatsByCompany {
  totalProjects: number
  totalDemands: number
  totalHeadcount: number
  totalCost: number
  projectDistribution: {
    projectId: number
    projectName: string
    demandCount: number
    headcount: number
    cost: number
  }[]
} 