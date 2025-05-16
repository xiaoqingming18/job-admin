import type { PageResult } from './common'

// 企业信息接口
export interface CompanyInfo {
  id: number
  name: string
  logo: string
  address: string
  contactPerson: string
  contactPhone: string
  email: string
  website: string
  industry: string
  size: string
  description: string
  legalPerson: string
  licenseNumber: string
  businessLicense: string
  status: string
  createTime: string
  updateTime: string
}

// 企业信息响应接口
export interface CompanyInfoResponse {
  code: number
  message: string
  data: CompanyInfo
}

// 系统管理员查看的企业详情
export interface CompanyAdminVO {
  id: number
  name: string
  logo: string
  address: string
  contactPerson: string
  contactPhone: string
  email: string
  website: string
  industry: string
  size: string
  description: string
  legalPerson: string
  licenseNumber: string
  status: string
  adminId: number
  adminUsername: string
  adminEmail: string
  adminMobile: string
  createTime: string
  updateTime: string
}

// 企业列表项
export interface CompanyListItem {
  id: number
  name: string
  licenseNumber: string
  legalPerson: string
  industry: string
  size: string
  status: string
  address: string
  createTime: string
}

// 企业列表响应
export interface CompanyListResponse {
  code: number
  message: string
  data: PageResult<CompanyListItem>
}

// 企业状态枚举
export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// 项目经理信息
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

// 项目经理列表响应
export interface ProjectManagerListResponse {
  code: number
  message: string
  data: ProjectManager[]
}

// 添加项目经理参数
export interface AddProjectManagerParams {
  username: string
  password: string
  email: string
  position: string
  companyId: number
}

export interface UpdateProjectManagerParams {
  id: number
  username?: string
  password?: string
  email?: string
  position?: string
  status?: 0 | 1
} 