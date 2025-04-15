import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import message from './message'
import router from '@/router'

// 错误码映射表
const ERROR_CODE_MAP: Record<number, string> = {
  40000: '请求参数错误',
  40100: '无权限操作',
  40300: '未授权访问',
  40400: '资源不存在',
  40005: 'token 错误或被篡改',
  40006: 'token 已失效',
  40007: '您所属的用户组不允许此操作',
  50000: '服务器内部错误'
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // API 请求的基础路径
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    
    // 如果有 token 则附带在请求头中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('Request error: ', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    
    // 根据 API 文档，后端统一返回格式 { code: number, data: any, message: string }
    // code 为 0 表示成功，其他值表示失败
    if (data.code === 0) {
      return data.data
    } else {
      // 处理业务错误
      const errorMessage = data.message || ERROR_CODE_MAP[data.code] || '未知错误'
      
      // 处理特定错误码
      if (data.code === 40005 || data.code === 40006) {
        // Token 错误或已过期，清除本地存储的用户信息并跳转到登录页
        localStorage.removeItem('token')
        router.push('/login')
        message.error('登录已过期，请重新登录')
      } else {
        message.error(errorMessage)
      }
      
      return Promise.reject(new Error(errorMessage))
    }
  },
  (error) => {
    // 处理 HTTP 错误
    let errorMessage = '网络连接异常，请稍后再试'
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          errorMessage = '未授权，请登录'
          // 清除用户信息并跳转到登录页
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求错误 (${status})`
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      errorMessage = '服务器无响应，请检查网络连接'
    }
    
    message.error(errorMessage)
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

/**
 * 封装 GET 请求
 * @param url 请求地址
 * @param params 请求参数
 * @param config 配置项
 * @returns Promise
 */
export const get = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.get(url, { params, ...config })
}

/**
 * 封装 POST 请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 配置项
 * @returns Promise
 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.post(url, data, config)
}

/**
 * 封装 PUT 请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 配置项
 * @returns Promise
 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.put(url, data, config)
}

/**
 * 封装 DELETE 请求
 * @param url 请求地址
 * @param params 请求参数
 * @param config 配置项
 * @returns Promise
 */
export const del = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.delete(url, { params, ...config })
}

/**
 * 封装上传文件请求
 * @param url 请求地址
 * @param file 文件对象
 * @param name 文件字段名
 * @param config 配置项
 * @returns Promise
 */
export const uploadFile = <T = any>(
  url: string,
  file: File,
  name: string = 'file',
  config?: AxiosRequestConfig
): Promise<T> => {
  const formData = new FormData()
  formData.append(name, file)
  
  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

export default {
  service,
  get,
  post,
  put,
  delete: del,
  uploadFile
}
