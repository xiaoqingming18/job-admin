import { get, post, put, del } from '@/utils/request'

/**
 * 工种模块 API 接口
 */

/**
 * 添加工种
 * @param data 工种信息
 */
export const addOccupation = (data: {
  name: string
  category: string
  description: string
  requiredCertificates: string
  averageDailyWage: number
}) => {
  return post('/occupation/add', data)
}

/**
 * 更新工种信息
 * @param data 工种信息
 */
export const updateOccupation = (data: {
  id: number
  name?: string
  description?: string
  averageDailyWage?: number
}) => {
  return put('/occupation/update', data)
}

/**
 * 查询工种列表
 * @param category 可选的类别过滤
 */
export const getOccupationList = (category?: string) => {
  return get('/occupation/list', { category })
}

/**
 * 查询工种详情
 * @param id 工种ID
 */
export const getOccupationInfo = (id: number) => {
  return get(`/occupation/info/${id}`)
}

/**
 * 删除工种
 * @param id 工种ID
 */
export const deleteOccupation = (id: number) => {
  return del(`/occupation/delete/${id}`)
}
