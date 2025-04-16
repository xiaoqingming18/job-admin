// 企业信息接口
export interface CompanyInfo {
  id: number
  name: string
  licenseNumber: string
  address: string
  legalPerson: string
  adminId: number
  adminName: string
  createTime: string
}

// 企业信息响应接口
export interface CompanyInfoResponse {
  code: number
  data: CompanyInfo | null
  message: string
} 