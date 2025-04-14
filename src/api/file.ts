import { uploadFile } from '@/utils/request'

/**
 * 文件模块 API 接口
 */

/**
 * 上传用户头像
 * @param file 头像文件
 */
export const uploadAvatar = (file: File) => {
  return uploadFile('/file/upload/avatar', file)
}
