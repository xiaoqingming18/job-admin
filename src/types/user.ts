/**
 * 用户角色枚举
 */
export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  COMPANY_ADMIN = 'company_admin',
  PROJECT_MANAGER = 'project_manager',
  JOB_SEEKER = 'job_seeker'
}

/**
 * 账号状态枚举
 */
export enum AccountStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}

/**
 * 用户基本信息（来自token验证）
 */
export interface UserBasicInfo {
  valid: boolean
  userId: number
  username: string
  role: UserRole
}

/**
 * 用户详细信息（来自用户详情接口）
 */
export interface UserDetailInfo {
  id: number
  username: string
  email: string | null
  mobile: string | null
  avatar: string | null
  realName: string | null
  role: UserRole
  accountStatus: AccountStatus
  createTime: string
  lastLoginTime: string | null
  
  // 企业管理员或项目经理特有字段
  companyId?: number
  companyName?: string
  position?: string
}

/**
 * 组合后的完整用户信息
 */
export interface UserInfo extends UserBasicInfo {
  email: string | null
  mobile: string | null
  avatar: string | null
  realName: string | null
  accountStatus: AccountStatus
  createTime: string
  lastLoginTime: string | null
  companyId?: number
  companyName?: string
  position?: string
} 