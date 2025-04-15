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
        <el-table-column prop="address" label="企业地址" min-width="240" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button link type="primary" @click.stop="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="primary" @click.stop="handleDetail(scope.row)">
              <el-icon><View /></el-icon>详情
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
      size="30%"
      :destroy-on-close="true"
    >
      <div v-if="currentCompany" class="company-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="企业名称">{{ currentCompany.name }}</el-descriptions-item>
          <el-descriptions-item label="营业执照号">{{ currentCompany.licenseNumber }}</el-descriptions-item>
          <el-descriptions-item label="法定代表人">{{ currentCompany.legalPerson }}</el-descriptions-item>
          <el-descriptions-item label="企业地址">{{ currentCompany.address }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentCompany.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button type="primary" @click="handleEdit(currentCompany)">编辑信息</el-button>
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
  View
} from '@element-plus/icons-vue'
import { getCompanyList, updateCompany, deleteCompany, addCompany } from '@/api/company'

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
  legalPerson: ''
})

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = ''
  searchForm.legalPerson = ''
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
      current: currentPage.value,
      size: pageSize.value,
      name: searchForm.name,
      legalPerson: searchForm.legalPerson
    }
    const res = await getCompanyList(params)
    companyList.value = res.data.records || []
    total.value = res.data.total || 0
    currentPage.value = res.data.current || 1
    pageSize.value = res.data.size || 10
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
const handleDetail = (row: any) => {
  currentCompany.value = row
  drawerVisible.value = true
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
  legalPerson: ''
})

const rules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  licenseNumber: [
    { required: true, message: '请输入营业执照号', trigger: 'blur' },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '请输入正确的营业执照号', trigger: 'blur' }
  ],
  address: [
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  legalPerson: [
    { required: true, message: '请输入法定代表人', trigger: 'blur' },
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
          await addCompany(form)
          ElMessage.success('添加企业成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || (isEdit.value ? '更新企业信息失败' : '添加企业失败'))
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