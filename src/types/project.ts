// 项目状态枚举
export enum ProjectStatus {
  Pending = 0,   // 未开始
  InProgress = 1, // 进行中
  Completed = 2   // 已完工
}

// 项目信息接口
export interface Project {
  id: number
  companyId: number
  name: string
  address: string
  province: string
  city: string
  district: string
  projectManagerId: number
  projectManagerName: string
  startDate: string
  expectedEndDate: string
  projectType: string
  projectScale: string
  totalArea: number
  budget: number
  description: string
  status: string
  createTime: string
  updateTime: string | null
}

// 分页参数接口
export interface PageParams {
  pageNum?: number
  pageSize?: number
}

// 企业项目列表查询参数
export interface CompanyProjectListParams extends PageParams {
  companyId: number
}

// 企业项目列表响应
export interface CompanyProjectListResponse {
  code: number
  data: Project[]
  message: string
} 