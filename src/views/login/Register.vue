<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="register-header">
        <h2>企业注册</h2>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="120px">
        <h3 class="section-title">企业信息</h3>
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入企业名称" />
        </el-form-item>
        
        <el-form-item label="营业执照号" prop="licenseNumber">
          <el-input v-model="registerForm.licenseNumber" placeholder="请输入18位统一社会信用代码" />
        </el-form-item>

        <el-form-item label="企业地址" prop="address">
          <el-input v-model="registerForm.address" placeholder="请输入企业地址" />
        </el-form-item>

        <el-form-item label="法定代表人" prop="legalPerson">
          <el-input v-model="registerForm.legalPerson" placeholder="请输入法定代表人姓名" />
        </el-form-item>

        <h3 class="section-title">管理员信息</h3>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入管理员用户名" />
        </el-form-item>

        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入登录密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入电子邮箱" />
        </el-form-item>

        <el-form-item label="职位" prop="position">
          <el-input v-model="registerForm.position" placeholder="请输入管理员职位" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister">
            提交注册
          </el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { registerCompany } from '@/api/company'

const router = useRouter()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  name: '',
  licenseNumber: '',
  address: '',
  legalPerson: '',
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  position: ''
})

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const validateLicenseNumber = (rule: any, value: string, callback: any) => {
  const pattern = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/
  if (!pattern.test(value)) {
    callback(new Error('请输入正确的18位统一社会信用代码'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  licenseNumber: [
    { required: true, message: '请输入营业执照号', trigger: 'blur' },
    { validator: validateLicenseNumber, trigger: 'blur' }
  ],
  address: [
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  legalPerson: [
    { required: true, message: '请输入法定代表人姓名', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 4, max: 50, message: '长度在4到50个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  position: [
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 构建请求数据，移除不需要发送的确认密码字段
        const requestData = { ...registerForm }
        delete requestData.confirmPassword
        
        // 调用注册API
        const res = await registerCompany(requestData)
        
        ElMessage.success('企业注册成功，请使用管理员账号登录')
        router.push('/login')
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后重试'
        ElMessage.error(errorMessage)
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.register-card {
  width: 600px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.section-title {
  font-size: 18px;
  color: #409EFF;
  margin: 20px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
}

.el-button {
  margin-right: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 