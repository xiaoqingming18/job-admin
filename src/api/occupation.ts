import { get, post, put, del } from '@/utils/request'
import type {
  AddOccupationParams,
  UpdateOccupationParams,
  AddOccupationCategoryParams,
  UpdateOccupationCategoryParams,
  UpdateOccupationStatusParams,
  OccupationSearchParams,
  CommonResponse,
  Occupation,
  OccupationCategory,
  OccupationListItem,
  PageResponse
} from '@/types/occupation'

/**
 * 工种模块 API 接口
 */

// ==================== 工种类别接口 ====================

/**
 * 添加工种类别
 * @param data 工种类别信息
 */
export const addOccupationCategory = (data: AddOccupationCategoryParams) => {
  return post<CommonResponse<OccupationCategory>>('/api/occupation/category/add', data)
}

/**
 * 更新工种类别
 * @param data 工种类别信息
 */
export const updateOccupationCategory = (data: UpdateOccupationCategoryParams) => {
  return put<CommonResponse<OccupationCategory>>('/api/occupation/category/update', data)
}

/**
 * 获取工种类别详情
 * @param id 类别ID
 */
export const getOccupationCategoryInfo = (id: number) => {
  return get<CommonResponse<OccupationCategory>>(`/api/occupation/category/info/${id}`)
}

/**
 * 获取工种类别列表
 */
export const getOccupationCategoryList = () => {
  return get<CommonResponse<OccupationCategory[]>>('/api/occupation/category/list')
}

/**
 * 删除工种类别
 * @param id 类别ID
 */
export const deleteOccupationCategory = (id: number) => {
  return del<CommonResponse<string>>(`/api/occupation/category/delete/${id}`)
}

// ==================== 工种接口 ====================

/**
 * 添加工种
 * @param data 工种信息
 */
export const addOccupation = (data: AddOccupationParams) => {
  return post<CommonResponse<Occupation>>('/api/occupation/add', data)
}

/**
 * 更新工种
 * @param data 工种信息
 */
export const updateOccupation = (data: UpdateOccupationParams) => {
  return put<CommonResponse<Occupation>>('/api/occupation/update', data)
}

/**
 * 更新工种状态
 * @param data 状态信息
 */
export const updateOccupationStatus = (data: UpdateOccupationStatusParams) => {
  return put<CommonResponse<Occupation>>('/api/occupation/status', data)
}

/**
 * 获取工种详情
 * @param id 工种ID
 */
export const getOccupationInfo = (id: number) => {
  return get<CommonResponse<Occupation>>(`/api/occupation/info/${id}`)
}

/**
 * 分页获取工种列表
 * @param params 分页和过滤参数
 */
export const getOccupationPage = (params: {
  page?: number
  size?: number
  categoryId?: number
}) => {
  return get<CommonResponse<PageResponse<OccupationListItem>>>('/api/occupation/page', params)
}

/**
 * 按类别获取工种列表
 * @param categoryId 类别ID
 */
export const getOccupationByCategory = (categoryId: number) => {
  return get<CommonResponse<OccupationListItem[]>>(`/api/occupation/by-category/${categoryId}`)
}

/**
 * 按日薪范围查询工种
 * @param params 日薪范围参数
 */
export const getOccupationByWage = (params: {
  minWage?: number
  maxWage?: number
}) => {
  return get<CommonResponse<OccupationListItem[]>>('/api/occupation/by-wage', params)
}

/**
 * 按难度等级查询工种
 * @param level 难度等级
 */
export const getOccupationByDifficulty = (level: number) => {
  return get<CommonResponse<OccupationListItem[]>>(`/api/occupation/by-difficulty/${level}`)
}

/**
 * 工种搜索
 * @param params 搜索参数
 */
export const searchOccupation = (params: OccupationSearchParams) => {
  return get<CommonResponse<OccupationListItem[]>>('/api/occupation/search', params)
}

/**
 * 获取热门工种
 * @param limit 返回数量，默认5
 */
export const getHotOccupations = (limit?: number) => {
  return get<CommonResponse<OccupationListItem[]>>('/api/occupation/hot', { limit })
}

/**
 * 删除工种
 * @param id 工种ID
 */
export const deleteOccupation = (id: number) => {
  return del<CommonResponse<string>>(`/api/occupation/delete/${id}`)
}
