/**
 * 工种类别接口
 */
export interface OccupationCategory {
  id: number
  name: string
  icon?: string
  description?: string
  sortOrder: number
  createTime?: string
  updateTime?: string
}

/**
 * 工种信息接口
 */
export interface Occupation {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  icon?: string
  description?: string
  requiredCertificates?: string[]
  averageDailyWage: number
  difficultyLevel: number
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * 工种列表项接口 (简化版的工种信息)
 */
export interface OccupationListItem {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  icon?: string
  averageDailyWage: number
  difficultyLevel: number
  status: number
}

/**
 * 分页响应接口
 */
export interface PageResponse<T> {
  total: number
  pages: number
  current: number
  size: number
  records: T[]
}

/**
 * 工种分页响应接口
 */
export interface OccupationPageResponse {
  code: number
  data: PageResponse<OccupationListItem>
  message: string
}

/**
 * 工种列表响应接口
 */
export interface OccupationListResponse {
  code: number
  data: OccupationListItem[]
  message: string
}

/**
 * 工种详情响应接口
 */
export interface OccupationDetailResponse {
  code: number
  data: Occupation
  message: string
}

/**
 * 工种类别列表响应接口
 */
export interface OccupationCategoryListResponse {
  code: number
  data: OccupationCategory[]
  message: string
}

/**
 * 工种类别详情响应接口
 */
export interface OccupationCategoryDetailResponse {
  code: number
  data: OccupationCategory
  message: string
}

/**
 * 工种搜索参数接口
 */
export interface OccupationSearchParams {
  name?: string
  categoryId?: number
  minWage?: number
  maxWage?: number
  difficultyLevel?: number
  page?: number
  size?: number
}

/**
 * 添加工种参数
 */
export interface AddOccupationParams {
  name: string
  categoryId: number
  icon?: string
  description?: string
  requiredCertificates?: string[]
  averageDailyWage: number
  difficultyLevel: number
}

/**
 * 更新工种参数
 */
export interface UpdateOccupationParams {
  id: number
  name?: string
  categoryId?: number
  icon?: string
  description?: string
  requiredCertificates?: string[]
  averageDailyWage?: number
  difficultyLevel?: number
}

/**
 * 添加工种类别参数
 */
export interface AddOccupationCategoryParams {
  name: string
  icon?: string
  description?: string
  sortOrder: number
}

/**
 * 更新工种类别参数
 */
export interface UpdateOccupationCategoryParams {
  id: number
  name?: string
  icon?: string
  description?: string
  sortOrder?: number
}

/**
 * 更新工种状态参数
 */
export interface UpdateOccupationStatusParams {
  id: number
  status: number
}

/**
 * 通用响应接口
 */
export interface CommonResponse<T> {
  code: number
  data: T
  message: string
} 