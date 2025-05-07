<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { verifyToken, getUserDetail } from '@/api/user'
import { ElMessage } from 'element-plus'

// 定义用户基本信息接口
interface UserInfoData {
  valid: boolean
  userId: number
  username: string
  role: string
}

// 定义用户详细信息接口
interface UserDetailData {
  id: number
  username: string
  email?: string
  mobile?: string
  avatar?: string
  realName?: string
  role: string
  accountStatus: string
  createTime: string
  lastLoginTime?: string
  company?: {
    id: number
    name: string
  }
}

// 初始化用户信息
const userInfo = ref<UserInfoData | null>(null)
const userDetail = ref<UserDetailData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 调用验证 token 的 API 获取用户基本信息
    const tokenResponse = await verifyToken()
    
    // 检查 API 响应是否成功
    if (tokenResponse && tokenResponse.data) {
      userInfo.value = tokenResponse.data
      console.log('Token验证信息:', userInfo.value)
      
      // 使用获取到的用户ID调用用户详细信息接口
      try {
        const detailResponse = await getUserDetail(userInfo.value.userId)
        if (detailResponse && detailResponse.data) {
          userDetail.value = detailResponse.data
          console.log('用户详细信息:', userDetail.value)
          
          // 组合两个接口的数据并输出到控制台
          console.log('=== 组合的用户信息 ===')
          console.log({
            // 基本信息
            valid: userInfo.value.valid,
            userId: userInfo.value.userId,
            username: userInfo.value.username,
            role: userInfo.value.role,
            // 详细信息
            email: userDetail.value.email,
            mobile: userDetail.value.mobile,
            avatar: userDetail.value.avatar,
            realName: userDetail.value.realName,
            accountStatus: userDetail.value.accountStatus,
            createTime: userDetail.value.createTime,
            lastLoginTime: userDetail.value.lastLoginTime,
            company: userDetail.value.company,
          })
        }
      } catch (detailErr: any) {
        console.error('获取用户详细信息失败:', detailErr)
      }
    } else {
      error.value = '无法获取用户信息'
      ElMessage.error('获取用户信息失败')
    }
  } catch (err: any) {
    error.value = err.message || '获取用户信息时发生错误'
    ElMessage.error(`获取用户信息失败: ${error.value}`)
    console.error('获取用户信息失败:', err)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="user-info-container">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="error" class="error">
      <el-alert type="error" :title="error" :closable="false" />
    </div>
    
    <div v-else-if="userInfo" class="user-info">
      <h3>用户信息</h3>
      <el-descriptions border direction="vertical" :column="1">
        <el-descriptions-item label="用户 ID">{{ userInfo.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag v-if="userInfo.role === 'system_admin'" type="danger">系统管理员</el-tag>
          <el-tag v-else-if="userInfo.role === 'company_admin'" type="warning">企业管理员</el-tag>
          <el-tag v-else-if="userInfo.role === 'project_manager'" type="success">项目经理</el-tag>
          <el-tag v-else type="info">{{ userInfo.role }}</el-tag>
        </el-descriptions-item>
        
        <!-- 显示用户详细信息 -->
        <template v-if="userDetail">
          <el-descriptions-item v-if="userDetail.realName" label="真实姓名">
            {{ userDetail.realName }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.email" label="邮箱">
            {{ userDetail.email }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.mobile" label="手机号">
            {{ userDetail.mobile }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.company" label="所属企业">
            {{ userDetail.company.name }}
          </el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag 
              :type="userDetail.accountStatus === 'active' ? 'success' : 'danger'"
            >
              {{ userDetail.accountStatus === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ userDetail.createTime }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.lastLoginTime" label="最后登录">
            {{ userDetail.lastLoginTime }}
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </div>
    
    <div v-else class="no-data">
      <el-empty description="无用户信息" />
    </div>
  </div>
</template>

<style scoped>
.user-info-container {
  margin: 20px 0;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading, .error, .no-data {
  padding: 20px 0;
}

.user-info h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
}
</style> 