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
  
  // 检查文件类型并使用不同的上传配置
  const isVideo = file.type.startsWith('video/');
  
  // 使用一个更长的超时时间，确保大型文件有足够时间上传
  return uploadFile<CommonResponse<UploadResponse>>('/file/upload', formData, 'file', {
    timeout: isVideo ? 600000 : 300000, // 视频10分钟超时，其他5分钟
    onUploadProgress: (progressEvent) => {
      // 计算并打印上传进度
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
      console.log('上传进度:', percentCompleted + '%');
    },
    // 视频文件添加重试机制
    maxRedirects: 5,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })
}
