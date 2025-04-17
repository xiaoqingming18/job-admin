import { Pagination, PageParams, PageResult } from './common'

// 企业信息接口
export interface CompanyInfo {
  id: number
  name: string
  logo: string
  address: string
  contactPerson: string
  contactPhone: string
  email: string
  businessLicense: string
  createTime: string
  updateTime: string
}

// 企业信息响应接口
export interface CompanyInfoResponse {
  code: number
  message: string
  data: CompanyInfo
}

// 项目经理信息接口
export interface ProjectManager {
  userId: number
  username: string
  mobile: string
  email: string
  avatar: string
  position: string
  companyId: number
  companyName: string
  createTime: string
  accountStatus: string
}

// 项目经理列表响应接口
export interface ProjectManagerListResponse {
  code: number
  message: string
  data: ProjectManager[]
}

// 添加项目经理请求参数
export interface AddProjectManagerParams {
  companyId: number
  username: string
  password: string
  email: string
  position: string
}

export interface UpdateProjectManagerParams {
  id: number
  username?: string
  password?: string
  email?: string
  position?: string
  status?: 0 | 1
} 