// 项目成员绩效评估类型定义

// 绩效评估对象
export interface MemberPerformance {
  id: number
  memberId: number
  memberName: string
  projectId: number
  projectName: string
  evaluationPeriod: string
  evaluatorId: number
  evaluatorName: string
  workQualityScore: number
  efficiencyScore: number
  attitudeScore: number
  teamworkScore: number
  totalScore: number
  strengths?: string
  weaknesses?: string
  comments?: string
  createTime: string
  updateTime: string
  position?: string
  occupationName?: string
}

// 添加绩效评估请求参数
export interface PerformanceAddParams {
  memberId: number
  projectId: number
  evaluationPeriod: string
  workQualityScore: number
  efficiencyScore: number
  attitudeScore: number
  teamworkScore: number
  strengths?: string
  weaknesses?: string
  comments?: string
}

// 更新绩效评估请求参数
export interface PerformanceUpdateParams {
  id: number
  workQualityScore: number
  efficiencyScore: number
  attitudeScore: number
  teamworkScore: number
  strengths?: string
  weaknesses?: string
  comments?: string
}

// 绩效评估查询参数
export interface PerformanceQueryParams {
  projectId?: number
  memberId?: number
  evaluationPeriod?: string
  pageNum?: number
  pageSize?: number
}

// 绩效评估分页结果
export interface PerformancePageResult {
  list: MemberPerformance[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
} 