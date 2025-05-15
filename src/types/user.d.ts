// 用户角色枚举
export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  COMPANY_ADMIN = 'company_admin',
  PROJECT_MANAGER = 'project_manager',
  JOB_SEEKER = 'job_seeker'
}

// 账号状态枚举
export enum AccountStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  PENDING = 'pending'
}

// 用户列表项
export interface UserListItem {
  id: number
  username: string
  mobile: string | null
  email: string
  avatar: string | null
  role: UserRole
  createTime: string
  accountStatus: AccountStatus
  realName: string | null
  companyName: string | null
}

// 用户列表分页结果
export interface UserListResult {
  pageNum: number
  pageSize: number
  total: number
  totalPages: number
  list: UserListItem[]
}

// 用户详情
export interface UserDetail {
  id: number
  username: string
  mobile: string | null
  email: string
  avatar: string | null
  role: UserRole
  createTime: string
  accountStatus: AccountStatus
  realName: string | null
  companyId: number | null
  companyName: string | null
  position: string | null
} 