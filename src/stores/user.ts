import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserRole, AccountStatus } from '@/types/user'
import type { UserInfo, UserBasicInfo, UserDetailInfo } from '@/types/user'
import { verifyToken, getUserDetail } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const loading = ref<boolean>(false)

  // Getters
  const isLoggedIn = computed(() => !!userInfo.value && !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === UserRole.SYSTEM_ADMIN)
  const isCompanyAdmin = computed(() => userInfo.value?.role === UserRole.COMPANY_ADMIN)
  const isProjectManager = computed(() => userInfo.value?.role === UserRole.PROJECT_MANAGER)
  const isJobSeeker = computed(() => userInfo.value?.role === UserRole.JOB_SEEKER)
  const userId = computed(() => userInfo.value?.userId)
  const username = computed(() => userInfo.value?.username)
  const userRole = computed(() => userInfo.value?.role)
  
  // 添加user属性作为userInfo的别名，确保向后兼容
  const user = computed(() => userInfo.value)
  
  // Actions
  /**
   * 保存Token到LocalStorage和状态管理
   */
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 从LocalStorage加载Token
   */
  function loadToken() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      return true
    }
    return false
  }

  /**
   * 清除用户数据和Token
   */
  function clearUserData() {
    userInfo.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  /**
   * 退出登录
   */
  function logout() {
    clearUserData()
  }

  /**
   * 获取并更新用户信息
   */
  async function fetchUserInfo(): Promise<boolean> {
    if (!token.value) {
      return false
    }

    loading.value = true
    try {
      // 验证Token获取基本信息
      const tokenResponse = await verifyToken()
      if (!tokenResponse || !tokenResponse.data || !tokenResponse.data.valid) {
        clearUserData()
        return false
      }

      const basicInfo: UserBasicInfo = {
        valid: tokenResponse.data.valid,
        userId: tokenResponse.data.userId,
        username: tokenResponse.data.username,
        role: tokenResponse.data.role as UserRole
      }

      // 获取用户详细信息
      try {
        const detailResponse = await getUserDetail(basicInfo.userId)
        if (detailResponse && detailResponse.data) {
          // 合并基本信息和详细信息
          userInfo.value = {
            ...basicInfo,
            email: detailResponse.data.email,
            mobile: detailResponse.data.mobile,
            avatar: detailResponse.data.avatar,
            realName: detailResponse.data.realName,
            accountStatus: detailResponse.data.accountStatus as AccountStatus,
            createTime: detailResponse.data.createTime,
            lastLoginTime: detailResponse.data.lastLoginTime,
            companyId: detailResponse.data.companyId,
            companyName: detailResponse.data.companyName,
            position: detailResponse.data.position
          }
        } else {
          // 只使用基本信息
          userInfo.value = {
            ...basicInfo,
            email: null,
            mobile: null,
            avatar: null,
            realName: null,
            accountStatus: AccountStatus.ENABLED,
            createTime: new Date().toISOString(),
            lastLoginTime: null
          }
        }
        return true
      } catch (error) {
        console.error('获取用户详情失败:', error)
        // 只使用基本信息
        userInfo.value = {
          ...basicInfo,
          email: null,
          mobile: null,
          avatar: null,
          realName: null,
          accountStatus: AccountStatus.ENABLED,
          createTime: new Date().toISOString(),
          lastLoginTime: null
        }
        return true
      }
    } catch (error) {
      console.error('验证用户Token失败:', error)
      clearUserData()
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 初始化:检查Token并获取用户信息
   */
  async function init() {
    const hasToken = loadToken()
    if (hasToken) {
      return await fetchUserInfo()
    }
    return false
  }

  return {
    // 状态
    userInfo,
    token,
    loading,
    
    // Getters
    isLoggedIn,
    isAdmin,
    isCompanyAdmin,
    isProjectManager,
    isJobSeeker,
    userId,
    username,
    userRole,
    user,
    
    // Actions
    setToken,
    loadToken,
    clearUserData,
    logout,
    fetchUserInfo,
    init
  }
}) 