import { get, post, put } from '@/utils/request'
import type { PageResult } from '@/types/common'
import type { 
  AttendanceQueryParams, 
  Attendance, 
  AttendanceStatistics, 
  ProjectAttendanceStatistics,
  UpdateAttendanceRequest 
} from '@/types/attendance'

/**
 * 签到
 * @param data 签到请求数据
 */
export function checkIn(data: { projectId: number; location?: string; remarks?: string }) {
  return post<any>('/api/attendance/check-in', data)
}

/**
 * 签退
 * @param data 签退请求数据
 */
export function checkOut(data: { projectId: number; location?: string; remarks?: string }) {
  return post<any>('/api/attendance/check-out', data)
}

/**
 * 获取个人考勤记录
 * @param params 查询参数
 */
export function getMyAttendanceRecords(params: AttendanceQueryParams) {
  return get<PageResult<Attendance>>('/api/attendance/my-records', params)
}

/**
 * 获取项目考勤记录
 * @param projectId 项目ID
 * @param params 查询参数
 */
export function getProjectAttendanceRecords(projectId: number, params: AttendanceQueryParams) {
  return get<PageResult<Attendance>>(`/api/attendance/project/${projectId}/records`, params)
}

/**
 * 修改考勤记录
 * @param id 考勤记录ID
 * @param data 修改数据
 */
export function updateAttendance(id: number, data: UpdateAttendanceRequest) {
  return put<any>(`/api/attendance/${id}`, data)
}

/**
 * 获取个人考勤统计
 * @param params 统计参数
 */
export function getMyAttendanceStatistics(params: { 
  startDate?: string; 
  endDate?: string; 
  projectId?: number 
}) {
  return get<AttendanceStatistics>('/api/attendance/statistics/my', params)
}

/**
 * 获取项目考勤统计
 * @param projectId 项目ID
 * @param params 统计参数
 */
export function getProjectAttendanceStatistics(
  projectId: number, 
  params: { startDate?: string; endDate?: string; memberId?: number }
) {
  return get<ProjectAttendanceStatistics>(`/api/attendance/statistics/project/${projectId}`, params)
}

/**
 * 批量导入考勤记录
 * @param projectId 项目ID
 * @param file Excel文件
 */
export function batchImportAttendance(projectId: number, file: File) {
  const formData = new FormData()
  formData.append('projectId', projectId.toString())
  formData.append('file', file)
  
  return post<any>('/api/attendance/batch-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出考勤记录 (返回Blob)
 * @param params 导出参数
 */
export function exportAttendance(params: { 
  projectId: number; 
  startDate: string; 
  endDate: string; 
  memberId?: number 
}) {
  return get<Blob>('/api/attendance/export', params, {
    responseType: 'blob'
  })
} 