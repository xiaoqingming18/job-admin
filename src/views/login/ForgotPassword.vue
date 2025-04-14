<template>
  <div class="forgot-password-container">
    <el-card class="forgot-password-card">
      <div class="forgot-password-header">
        <h2>找回密码</h2>
      </div>
      
      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 40px">
        <el-step title="验证身份" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1：验证身份 -->
      <el-form v-if="activeStep === 1" :model="verifyForm" :rules="verifyRules" ref="verifyFormRef">
        <el-form-item prop="email">
          <el-input
            v-model="verifyForm.email"
            placeholder="请输入注册邮箱"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="verifyCode">
          <div class="verify-code-container">
            <el-input
              v-model="verifyForm.verifyCode"
              placeholder="请输入验证码"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              :disabled="!!countdown"
              @click="sendVerifyCode"
            >
              {{ countdown ? \`\${countdown}秒后重试\` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="verifyIdentity" :loading="loading" style="width: 100%">
            下一步
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 步骤2：重置密码 -->
      <el-form v-if="activeStep === 2" :model="resetForm" :rules="resetRules" ref="resetFormRef">
        <el-form-item prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="resetPassword" :loading="loading" style="width: 100%">
            提交
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 步骤3：完成 -->
      <div v-if="activeStep === 3" class="success-container">
        <el-icon class="success-icon" color="#67C23A"><CircleCheck /></el-icon>
        <h3>密码重置成功</h3>
        <p>请使用新密码登录系统</p>
        <el-button type="primary" @click="goToLogin" style="width: 200px; margin-top: 20px">
          返回登录
        </el-button>
      </div>

      <div class="bottom-link">
        <router-link to="/login">返回登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Message, Key, Lock, CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()
const activeStep = ref(1)
const loading = ref(false)
const countdown = ref(0)

const verifyFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()

const verifyForm = reactive({
  email: '',
  verifyCode: ''
})

const resetForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const verifyRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const resetRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendVerifyCode = async () => {
  if (!verifyForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  try {
    // TODO: 调用发送验证码API
    // await sendCode(verifyForm.email)
    ElMessage.success('验证码已发送到您的邮箱')
    startCountdown()
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败')
  }
}

const verifyIdentity = async () => {
  if (!verifyFormRef.value) return
  
  await verifyFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: 调用验证身份API
        // await verifyCode(verifyForm)
        activeStep.value = 2
      } catch (error: any) {
        ElMessage.error(error.message || '验证失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: 调用重置密码API
        // await resetPassword({ ...resetForm, email: verifyForm.email })
        activeStep.value = 3
      } catch (error: any) {
        ElMessage.error(error.message || '重置密码失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-card {
  width: 500px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.verify-code-container {
  display: flex;
  gap: 10px;
}

.verify-code-container .el-input {
  flex: 1;
}

.success-container {
  text-align: center;
  padding: 40px 0;
}

.success-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.bottom-link {
  text-align: center;
  margin-top: 20px;
}

.bottom-link a {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
}

.bottom-link a:hover {
  color: #66b1ff;
}
</style> 