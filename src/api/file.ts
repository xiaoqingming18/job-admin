import { uploadFile } from '@/utils/request'
import type { CommonResponse } from '@/types/occupation'

/**
 * 文件模块 API 接口
 */

interface UploadResponse {
  url: string
  objectName: string
}

/**
 * 上传用户头像
 * @param file 头像文件
 */
export const uploadAvatar = (file: File) => {
  return uploadFile<CommonResponse<UploadResponse>>('/file/upload/avatar', file)
}

/**
 * 通用文件上传
 * @param file 文件对象
 * @param directory 存储目录，默认为"common"
 */
export const upload = (file: File, directory?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  return uploadFile<CommonResponse<UploadResponse>>('/file/upload', file)
}
