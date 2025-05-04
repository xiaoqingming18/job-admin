<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2>系统登录</h2>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item prop="userType">
          <el-select v-model="loginForm.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="系统管理员" value="admin" />
            <el-option label="企业管理员" value="company" />
            <el-option label="项目经理" value="manager" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>

        <div class="login-options">
          <router-link to="/register">企业注册</router-link>
          <router-link to="/forgot-password">忘记密码？</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { adminLogin, companyAdminLogin, projectManagerLogin } from '@/api/user'
import { useCompanyStore } from '@/stores/company'
import { isCompanyAdmin, isProjectManager } from '@/utils/auth'
import { initSocket } from '@/utils/socket'

/**
 * 从JWT令牌中解析用户ID
 * @param token JWT令牌
 * @returns 用户ID或undefined
 */
const extractUserIdFromToken = (token: string): number | undefined => {
  try {
    // JWT令牌由三部分组成，以点(.)分隔，第二部分是payload
    const payload = token.split('.')[1];
    // Base64解码
    const decodedPayload = atob(payload);
    // 解析JSON
    const data = JSON.parse(decodedPayload);
    // 返回userId
    return data.userId;
  } catch (error) {
    console.error('解析令牌失败:', error);
    return undefined;
  }
};

interface LoginResponse {
  code: number;
  data: {
    token: string;
    userId?: number;
  };
  message: string;
}

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  userType: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const { username, password, userType } = loginForm
        let response: LoginResponse

        // 根据用户类型调用不同的登录API
        switch (userType) {
          case 'admin':
            response = await adminLogin({ username, password })
            break
          case 'company':
            response = await companyAdminLogin({ username, password })
            break
          case 'manager':
            response = await projectManagerLogin({ username, password })
            break
          default:
            throw new Error('未知的用户类型')
        }

        // 检查并保存token
        if (!response?.data?.token) {
          throw new Error('登录失败：未获取到有效的token')
        }

        // 保存token
        const token = response.data.token;
        localStorage.setItem('token', token);
        // 保存用户类型
        localStorage.setItem('userType', userType);
        // 保存用户ID
        if (response.data.userId) {
          localStorage.setItem('userId', response.data.userId.toString());
        } else {
          // 尝试从令牌中解析userId
          const userId = extractUserIdFromToken(token);
          if (userId) {
            localStorage.setItem('userId', userId.toString());
          }
        }

        // 在登录成功后初始化 WebSocket 连接
        console.log('登录成功，初始化WebSocket连接');
        initSocket(token);

        // 如果是企业管理员或项目经理，获取企业信息
        if (userType === 'company' || userType === 'manager') {
          const companyStore = useCompanyStore()
          try {
            await companyStore.fetchCompanyInfo()
          } catch (error) {
            console.error('获取企业信息失败:', error)
            // 这里我们不阻止登录流程，只是记录错误
          }
        }

        ElMessage.success('登录成功')
        
        // 获取重定向地址
        const redirect = router.currentRoute.value.query.redirect as string
        // 跳转到重定向地址或默认首页
        router.push(redirect || '/dashboard')
      } catch (error: any) {
        // 显示具体的错误信息
        const errorMessage = error.response?.data?.message || error.message || '登录失败，请稍后重试'
        ElMessage.error(errorMessage)
        
        // 如果是密码错误，清空密码字段
        if (errorMessage.includes('密码错误') || errorMessage.includes('账号或密码不正确')) {
          loginForm.password = ''
        }
        // 如果是用户类型错误，清空用户类型
        if (errorMessage.includes('无法登录')) {
          loginForm.userType = ''
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.login-options a {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
}

.login-options a:hover {
  color: #66b1ff;
}
</style> 