import request from '@/utils/request'

// 证书类型相关接口
/**
 * 获取证书类型列表
 */
export function getCertificateTypes(params: any) {
  return request.get('/api/admin/certificate-types', params)
}

/**
 * 获取证书类型详情
 */
export function getCertificateTypeDetail(id: string | number) {
  return request.get(`/api/admin/certificate-types/${id}`)
}

/**
 * 添加证书类型
 */
export function addCertificateType(data: any) {
  return request.post('/api/admin/certificate-types', data)
}

/**
 * 更新证书类型
 */
export function updateCertificateType(id: string | number, data: any) {
  return request.put(`/api/admin/certificate-types/${id}`, data)
}

/**
 * 删除证书类型
 */
export function deleteCertificateType(id: string | number) {
  return request.delete(`/api/admin/certificate-types/${id}`)
}

/**
 * 上传证书类型图标
 */
export function uploadCertificateIcon(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post('/api/admin/certificate-types/upload-icon', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 求职者证书审核相关接口
/**
 * 获取待审核证书列表
 */
export function getCertificateVerificationList(params: any) {
  return request.get('/api/admin/certificate-verifications', params)
}

/**
 * 获取证书审核详情
 */
export function getCertificateVerificationDetail(id: string | number) {
  return request.get(`/api/admin/certificate-verifications/${id}`)
}

/**
 * 审核证书
 */
export function verifyCertificate(id: string | number, data: any) {
  return request.post(`/api/admin/certificate-verifications/${id}`, data)
} 