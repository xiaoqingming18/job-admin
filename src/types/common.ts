/**
 * 通用类型定义
 */

/**
 * 分页参数接口
 */
export interface PageParams {
  page?: number
  size?: number
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
 * 通用响应接口
 */
export interface CommonResponse<T> {
  code: number
  data: T
  message: string
} 