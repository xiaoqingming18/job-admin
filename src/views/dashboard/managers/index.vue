<template>
  <div class="managers-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">项目经理管理</h2>
        <span class="subtitle">管理企业项目经理账号</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加项目经理
        </el-button>
        <el-button @click="fetchData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 项目经理列表 -->
    <el-card class="list-container" shadow="hover" v-loading="loading">
      <el-table 
        :data="managerList" 
        border 
        stripe 
        style="width: 100%"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="50" align="center" label="#" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar" v-if="scope.row.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar :size="40" v-else><el-icon><User /></el-icon></el-avatar>
              <div class="user-details">
                <div class="username">{{ scope.row.username }}</div>
                <div class="email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" min-width="130" />
        <el-table-column prop="position" label="职位" min-width="130" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.accountStatus)">
              {{ formatStatus(scope.row.accountStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty 
        v-if="managerList.length === 0 && !loading"
        description="暂无项目经理数据" 
      />
    </el-card>

    <!-- 项目经理详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="项目经理详情"
      size="30%"
      :destroy-on-close="true"
    >
      <div v-if="currentManager" class="manager-detail">
        <div class="manager-header">
          <el-avatar :size="80" :src="currentManager.avatar" v-if="currentManager.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <el-avatar :size="80" v-else><el-icon><User /></el-icon></el-avatar>
          <h2>{{ currentManager.username }}</h2>
          <el-tag :type="getStatusType(currentManager.accountStatus)">
            {{ formatStatus(currentManager.accountStatus) }}
          </el-tag>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="职位">{{ currentManager.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentManager.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentManager.mobile || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属企业">{{ currentManager.companyName }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(currentManager.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button type="primary" @click="handleEdit(currentManager)">编辑信息</el-button>
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 项目经理编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑项目经理' : '添加项目经理'"
      width="500px"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="用户名" prop="username" v-if="!isEdit">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="form.confirmPassword" placeholder="请再次输入密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile" v-if="isEdit">
          <el-input v-model="form.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
            <el-option label="锁定" value="locked" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Refresh,
  User
} from '@element-plus/icons-vue'
import { 
  addProjectManager, 
  getCompanyManagerList, 
  deleteProjectManager 
} from '@/api/company'
import { useCompanyStore } from '@/stores/company'
import type { ProjectManager, AddProjectManagerParams } from '@/types/company'

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date).replace(/\//g, '-')
}

// 项目经理列表数据
const managerList = ref<ProjectManager[]>([])
const loading = ref(false)
const currentManager = ref<ProjectManager | null>(null)
const detailDrawerVisible = ref(false)

// 获取项目经理列表
const fetchData = async () => {
  loading.value = true
  try {
    const companyStore = useCompanyStore()
    if (!companyStore.companyId) {
      await companyStore.fetchCompanyInfo()
    }

    if (companyStore.companyId) {
      const res = await getCompanyManagerList(companyStore.companyId)
      if (res.code === 0) {
        managerList.value = res.data || []
      } else {
        throw new Error(res.message || '获取项目经理列表失败')
      }
    } else {
      throw new Error('获取企业信息失败')
    }
  } catch (error: any) {
    console.error('获取项目经理列表失败:', error)
    ElMessage.error(error.message || '获取项目经理列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 编辑表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  id: 0,
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  mobile: '',
  position: '',
  status: 'enabled'
})

// 表单校验规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 验证手机号
const validateMobile = (rule: any, value: string, callback: any) => {
  if (isEdit.value && !value) {
    callback()
    return
  }
  
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 50, message: '长度在 4 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  mobile: [
    { validator: validateMobile, trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ]
}

// 添加项目经理
const handleAdd = () => {
  isEdit.value = false
  form.id = 0
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  form.email = ''
  form.mobile = ''
  form.position = ''
  form.status = 'enabled'
  
  dialogVisible.value = true
}

// 编辑项目经理
const handleEdit = (row: ProjectManager) => {
  isEdit.value = true
  form.id = row.userId
  form.username = row.username
  form.email = row.email
  form.mobile = row.mobile || ''
  form.position = row.position || ''
  form.status = row.accountStatus
  
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        submitting.value = true
        const companyStore = useCompanyStore()
        
        if (!companyStore.companyId) {
          throw new Error('获取企业信息失败')
        }

        if (!isEdit.value) {
          // 添加项目经理
          const params: AddProjectManagerParams = {
            companyId: companyStore.companyId,
            username: form.username,
            password: form.password,
            email: form.email,
            position: form.position
          }
          
          const res = await addProjectManager(params)
          if (res.code === 0) {
            ElMessage.success('添加项目经理成功')
            dialogVisible.value = false
            fetchData()
          } else {
            throw new Error(res.message || '添加项目经理失败')
          }
        } else {
          // 编辑项目经理功能
          // 注意：由于当前API文档中未提供编辑项目经理的接口，这里使用模拟成功的方式进行提示
          // 实际项目中需要根据具体API实现编辑功能
          ElMessage.success('编辑项目经理成功（模拟）')
          dialogVisible.value = false
          fetchData()
        }
      } catch (error: any) {
        console.error('操作失败:', error)
        ElMessage.error(error.message || '操作失败，请稍后再试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除项目经理
const handleDelete = (row: ProjectManager) => {
  ElMessageBox.confirm(
    `确定要删除项目经理 "${row.username}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteProjectManager(row.userId)
      if (res.code === 0) {
        ElMessage.success('删除项目经理成功')
        fetchData()
      } else {
        throw new Error(res.message || '删除项目经理失败')
      }
    } catch (error: any) {
      console.error('删除项目经理失败:', error)
      ElMessage.error(error.message || '删除项目经理失败，请稍后再试')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 格式化状态
const formatStatus = (status: string) => {
  switch (status) {
    case 'enabled':
      return '启用'
    case 'disabled':
      return '禁用'
    case 'locked':
      return '锁定'
    default:
      return status
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'enabled':
      return 'success'
    case 'disabled':
      return 'danger'
    case 'locked':
      return 'warning'
    default:
      return 'info'
  }
}

// 表格行点击查看详情
const handleRowClick = (row: ProjectManager) => {
  currentManager.value = row
  detailDrawerVisible.value = true
}

// 加载初始数据
onMounted(async () => {
  fetchData()
})
</script>

<style scoped>
.managers-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
}

.actions-section {
  display: flex;
  gap: 12px;
}

.list-container {
  margin-bottom: 24px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: #303133;
}

.email {
  font-size: 12px;
  color: #909399;
}

.manager-detail {
  padding: 0 20px;
}

.manager-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #ebeef5;
}

.manager-header h2 {
  margin: 10px 0;
}

.drawer-footer {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}
</style> 