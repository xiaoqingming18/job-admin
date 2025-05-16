<template>
  <div class="companies-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">企业管理</h2>
        <span class="subtitle">管理系统中的企业信息</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加企业
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="企业名称">
          <el-input v-model="searchForm.name" placeholder="请输入企业名称" clearable />
        </el-form-item>
        <el-form-item label="法定代表人">
          <el-input v-model="searchForm.legalPerson" placeholder="请输入法定代表人" clearable />
        </el-form-item>
        <el-form-item label="企业状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="CompanyStatus.ACTIVE" />
            <el-option label="已禁用" :value="CompanyStatus.INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="行业">
          <el-select v-model="searchForm.industry" placeholder="请选择行业" clearable>
            <el-option v-for="item in industryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Delete /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 企业列表 -->
    <el-card class="list-container" shadow="hover">
      <el-table 
        v-loading="loading" 
        :data="companyList" 
        border 
        stripe 
        style="width: 100%"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="50" align="center" label="#" />
        <el-table-column prop="name" label="企业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="licenseNumber" label="营业执照号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="legalPerson" label="法定代表人" width="120" align="center" />
        <el-table-column prop="industry" label="所属行业" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === CompanyStatus.ACTIVE ? 'success' : 'danger'">
              {{ scope.row.status === CompanyStatus.ACTIVE ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="企业地址" min-width="240" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280" align="center">
          <template #default="scope">
            <el-button link type="primary" @click.stop="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="primary" @click.stop="handleDetail(scope.row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button 
              link 
              :type="scope.row.status === CompanyStatus.ACTIVE ? 'danger' : 'success'"
              @click.stop="handleToggleStatus(scope.row)"
            >
              <el-icon><component :is="scope.row.status === CompanyStatus.ACTIVE ? 'CircleClose' : 'CircleCheck'" /></el-icon>
              {{ scope.row.status === CompanyStatus.ACTIVE ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click.stop="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 企业详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="企业详情"
      size="40%"
      :destroy-on-close="true"
    >
      <div v-if="currentCompany" class="company-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="企业名称">{{ currentCompany.name }}</el-descriptions-item>
          <el-descriptions-item label="营业执照号">{{ currentCompany.licenseNumber }}</el-descriptions-item>
          <el-descriptions-item label="法定代表人">{{ currentCompany.legalPerson }}</el-descriptions-item>
          <el-descriptions-item label="企业地址">{{ currentCompany.address }}</el-descriptions-item>
          <el-descriptions-item label="所属行业">{{ currentCompany.industry }}</el-descriptions-item>
          <el-descriptions-item label="企业规模">{{ currentCompany.size }}</el-descriptions-item>
          <el-descriptions-item label="企业网站">{{ currentCompany.website || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentCompany.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCompany.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="电子邮箱">{{ currentCompany.email }}</el-descriptions-item>
          <el-descriptions-item label="企业状态">
            <el-tag :type="currentCompany.status === CompanyStatus.ACTIVE ? 'success' : 'danger'">
              {{ currentCompany.status === CompanyStatus.ACTIVE ? '正常' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="管理员">{{ currentCompany.adminUsername }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentCompany.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentCompany.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="企业描述">
            <div class="company-description">{{ currentCompany.description || '-' }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button type="primary" @click="handleEdit(currentCompany)">编辑信息</el-button>
          <el-button 
            :type="currentCompany.status === CompanyStatus.ACTIVE ? 'danger' : 'success'"
            @click="handleToggleStatus(currentCompany)"
          >
            {{ currentCompany.status === CompanyStatus.ACTIVE ? '禁用企业' : '启用企业' }}
          </el-button>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 企业编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑企业' : '添加企业'"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="营业执照号" prop="licenseNumber" v-if="!isEdit">
          <el-input v-model="form.licenseNumber" placeholder="请输入营业执照号" />
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入企业地址" />
        </el-form-item>
        <el-form-item label="法定代表人" prop="legalPerson">
          <el-input v-model="form.legalPerson" placeholder="请输入法定代表人" />
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="form.industry" placeholder="请选择行业">
            <el-option v-for="item in industryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业规模" prop="size">
          <el-select v-model="form.size" placeholder="请选择企业规模">
            <el-option label="1-49人" value="1-49" />
            <el-option label="50-199人" value="50-199" />
            <el-option label="200-499人" value="200-499" />
            <el-option label="500-999人" value="500-999" />
            <el-option label="1000-9999人" value="1000-9999" />
            <el-option label="10000人以上" value="10000+" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="企业网站" prop="website">
          <el-input v-model="form.website" placeholder="请输入企业网站" />
        </el-form-item>
        <el-form-item label="企业描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入企业描述" />
        </el-form-item>
        <el-form-item label="管理员用户名" prop="username" v-if="!isEdit">
          <el-input v-model="form.username" placeholder="请输入管理员用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" placeholder="请输入密码" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="form.confirmPassword" placeholder="请再次输入密码" type="password" />
        </el-form-item>
        <el-form-item label="管理员职位" prop="position" v-if="!isEdit">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
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
  Search,
  Refresh,
  View,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { getCompanyList, updateCompany, deleteCompany, registerCompany, getAdminCompanyList, getAdminCompanyDetail, updateCompanyStatus } from '@/api/company'
import { CompanyStatus } from '@/types/company'

// 行业选项
const industryOptions = [
  { value: 'construction', label: '建筑/工程' },
  { value: 'manufacturing', label: '制造业' },
  { value: 'energy', label: '能源/矿产' },
  { value: 'agriculture', label: '农业/林业' },
  { value: 'transportation', label: '交通/物流' },
  { value: 'real_estate', label: '房地产' },
  { value: 'other', label: '其他' }
]

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 公司列表数据
const companyList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  name: '',
  legalPerson: '',
  status: '',
  industry: ''
})

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = ''
  searchForm.legalPerson = ''
  searchForm.status = ''
  searchForm.industry = ''
  fetchData()
}

// 执行搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 获取企业列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.name,
      status: searchForm.status,
      industry: searchForm.industry
    }
    const res = await getAdminCompanyList(params)
    companyList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取企业列表失败', error)
    ElMessage.error('获取企业列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 刷新列表
const refreshList = () => {
  fetchData()
}

// 页码和每页数量变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  fetchData()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchData()
}

// 点击行
const handleRowClick = (row: any) => {
  handleDetail(row)
}

// 企业详情抽屉
const drawerVisible = ref(false)
const currentCompany = ref<any>(null)

// 查看企业详情
const handleDetail = async (row: any) => {
  try {
    const res = await getAdminCompanyDetail(row.id)
    currentCompany.value = res.data
    drawerVisible.value = true
  } catch (error) {
    console.error('获取企业详情失败', error)
    ElMessage.error('获取企业详情失败，请稍后再试')
  }
}

// 切换企业状态
const handleToggleStatus = async (company: any) => {
  const newStatus = company.status === CompanyStatus.ACTIVE ? CompanyStatus.INACTIVE : CompanyStatus.ACTIVE
  const statusText = newStatus === CompanyStatus.ACTIVE ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}企业 "${company.name}" 吗？`,
      `${statusText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === CompanyStatus.ACTIVE ? 'success' : 'warning'
      }
    )
    
    await updateCompanyStatus({
      id: company.id,
      status: newStatus
    })
    
    ElMessage.success(`${statusText}企业成功`)
    
    // 更新当前数据
    if (drawerVisible.value && currentCompany.value) {
      currentCompany.value.status = newStatus
    }
    
    // 刷新列表
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}企业失败：${error.message || '未知错误'}`)
    }
  }
}

// 编辑表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  licenseNumber: '',
  address: '',
  legalPerson: '',
  industry: '',
  size: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  website: '',
  description: '',
  username: '',
  password: '',
  confirmPassword: '',
  position: ''
})

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
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

const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const pattern = /^1[3-9]\d{9}$/
  if (!pattern.test(value)) {
    callback(new Error('请输入正确的手机号码'))
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
  industry: [
    { required: true, message: '请选择所属行业', trigger: 'change' }
  ],
  size: [
    { required: true, message: '请选择企业规模', trigger: 'change' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  website: [
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
  ],
  username: [
    { required: !isEdit.value, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 4, max: 50, message: '长度在4到50个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: !isEdit.value, validator: validatePass2, trigger: 'blur' }
  ],
  position: [
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ]
}

// 编辑企业
const handleEdit = (row: any) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.licenseNumber = row.licenseNumber
  form.address = row.address || ''
  form.legalPerson = row.legalPerson
  form.industry = row.industry || ''
  form.size = row.size || ''
  form.contactPerson = row.contactPerson || ''
  form.contactPhone = row.contactPhone || ''
  form.email = row.email || ''
  form.website = row.website || ''
  form.description = row.description || ''
  dialogVisible.value = true
  drawerVisible.value = false
}

// 添加企业
const handleAdd = () => {
  isEdit.value = false
  form.id = 0
  form.name = ''
  form.licenseNumber = ''
  form.address = ''
  form.legalPerson = ''
  form.industry = ''
  form.size = ''
  form.contactPerson = ''
  form.contactPhone = ''
  form.email = ''
  form.website = ''
  form.description = ''
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  form.position = ''
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateCompany(form)
          ElMessage.success('更新企业信息成功')
        } else {
          const requestData = { ...form }
          delete requestData.confirmPassword
          delete requestData.id
          
          await registerCompany(requestData)
          ElMessage.success('添加企业成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || (isEdit.value ? '更新企业信息失败' : '添加企业失败')
        ElMessage.error(errorMessage)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除企业
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除企业 "${row.name}" 吗？此操作不可逆。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteCompany(row.id)
      ElMessage.success('删除企业成功')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除企业失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 加载初始数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.companies-container {
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

.filter-container {
  margin-bottom: 24px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.list-container {
  margin-bottom: 24px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.company-details {
  padding: 0 20px;
}

.company-description {
  white-space: pre-wrap;
  line-height: 1.5;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

.drawer-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 