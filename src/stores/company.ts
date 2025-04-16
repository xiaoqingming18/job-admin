import { defineStore } from 'pinia'
import { getUserCompanyInfo } from '@/api/company'
import type { CompanyInfo } from '@/types/company'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    companyInfo: null as CompanyInfo | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    // 是否已加载企业信息
    hasCompanyInfo: (state) => state.companyInfo !== null,
    // 获取企业ID
    companyId: (state) => state.companyInfo?.id,
    // 获取企业名称
    companyName: (state) => state.companyInfo?.name,
    // 是否正在加载
    isLoading: (state) => state.loading
  },

  actions: {
    // 获取用户所属企业信息
    async fetchCompanyInfo() {
      if (this.loading) return
      
      this.loading = true
      this.error = null
      
      try {
        const response = await getUserCompanyInfo()
        if (response.code === 0 && response.data) {
          this.companyInfo = response.data
        } else {
          throw new Error(response.message || '获取企业信息失败')
        }
      } catch (error: any) {
        this.error = error.message || '获取企业信息失败'
        this.companyInfo = null
        throw error
      } finally {
        this.loading = false
      }
    },

    // 清除企业信息（用于用户登出时）
    clearCompanyInfo() {
      this.companyInfo = null
      this.error = null
    }
  }
}) 