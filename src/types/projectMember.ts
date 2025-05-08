// 项目成员状态枚举
export enum MemberStatus {
  ACTIVE = 'active',      // 在职
  INACTIVE = 'inactive',  // 暂停工作
  PENDING = 'pending',    // 待入场
  LEFT = 'left'           // 已离场
}

// 项目成员类型
export interface ProjectMember {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  realName: string | null;
  mobile: string | null;
  jobTypeId: number;
  jobTypeName: string;
  position: string;
  dailyWage: number;
  joinDate: string;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  contractId: number | null;
  status: string;
  statusDesc: string;
  attendanceCode: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  remarks: string | null;
  createTime: string;
  updateTime: string;
}

// 添加项目成员请求参数
export interface AddProjectMemberParams {
  projectId: number;
  userId: number;
  jobTypeId: number;
  position: string;
  dailyWage: number;
  joinDate: string;
  plannedEndDate?: string;
  status?: string;
  attendanceCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  remarks?: string;
  contractId?: number;
}

// 更新项目成员请求参数
export interface UpdateProjectMemberParams {
  id: number;
  position?: string;
  dailyWage?: number;
  plannedEndDate?: string;
  actualEndDate?: string;
  status?: string;
  attendanceCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  remarks?: string;
  contractId?: number;
}

// 更新项目成员状态请求参数
export interface UpdateMemberStatusParams {
  id: number;
  status: string;
  remarks?: string;
}

// 分页查询参数
export interface ProjectMemberQueryParams {
  projectId?: number;
  userId?: number;
  jobTypeId?: number;
  position?: string;
  status?: string;
  attendanceCode?: string;
  pageNum: number;
  pageSize: number;
}

// 分页查询响应
export interface ProjectMemberPageResult {
  total: number;
  list: ProjectMember[];
  pageNum: number;
  pageSize: number;
} 