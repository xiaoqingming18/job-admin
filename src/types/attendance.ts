/**
 * 考勤状态枚举
 */
export enum AttendanceStatus {
  NORMAL = 'normal',
  LATE = 'late',
  EARLY_LEAVE = 'early_leave',
  ABSENT = 'absent',
  LEAVE = 'leave',
  HOLIDAY = 'holiday'
}

/**
 * 考勤状态描述
 */
export const AttendanceStatusDesc: Record<string, string> = {
  [AttendanceStatus.NORMAL]: '正常',
  [AttendanceStatus.LATE]: '迟到',
  [AttendanceStatus.EARLY_LEAVE]: '早退',
  [AttendanceStatus.ABSENT]: '缺勤',
  [AttendanceStatus.LEAVE]: '请假',
  [AttendanceStatus.HOLIDAY]: '节假日'
}

/**
 * 考勤记录查询参数
 */
export interface AttendanceQueryParams {
  projectId?: number;
  memberId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

/**
 * 考勤记录实体
 */
export interface Attendance {
  id: number;
  memberId: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: AttendanceStatus;
  statusDesc: string;
  workHours: number | null;
  location: string | null;
  remarks: string | null;
  createTime: string;
}

/**
 * 更新考勤记录请求
 */
export interface UpdateAttendanceRequest {
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  workHours?: number;
  remarks?: string;
}

/**
 * 个人考勤统计
 */
export interface AttendanceStatistics {
  totalDays: number;
  workDays: number;
  attendanceDays: number;
  absenceDays: number;
  leaveDays: number;
  normalDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  totalWorkHours: number;
  averageDailyHours: number;
  attendanceRate: number;
}

/**
 * 项目信息
 */
export interface ProjectInfo {
  id: number;
  name: string;
  totalMembers: number;
}

/**
 * 考勤汇总
 */
export interface AttendanceSummary {
  totalDays: number;
  workDays: number;
  totalAttendanceCount: number;
  normalCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absenceCount: number;
  leaveCount: number;
  averageAttendanceRate: number;
}

/**
 * 项目成员考勤详情
 */
export interface MemberAttendanceDetail {
  memberId: number;
  userId: number;
  userName: string;
  attendanceDays: number;
  absenceDays: number;
  leaveDays: number;
  normalDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  attendanceRate: number;
}

/**
 * 项目考勤统计
 */
export interface ProjectAttendanceStatistics {
  projectInfo: ProjectInfo;
  attendanceSummary: AttendanceSummary;
  memberDetails: MemberAttendanceDetail[];
}

/**
 * 批量导入结果
 */
export interface BatchImportResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  failureRecords: {
    rowIndex: number;
    message: string;
  }[];
} 