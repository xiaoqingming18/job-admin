<template>
  <div class="labor-demands-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">劳务需求管理</h2>
        <span class="subtitle">企业管理员视图 - 管理企业下所有项目的劳务需求</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新建需求
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="需求标题">
          <el-input v-model="searchForm.keyword" placeholder="请输入需求标题" clearable />
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="searchForm.projectId" placeholder="请选择项目" clearable filterable>
            <el-option 
              v-for="project in projectOptions" 
              :key="project.id" 
              :label="project.name" 
              :value="project.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工种">
          <el-select v-model="searchForm.occupationId" placeholder="请选择工种" clearable filterable>
            <el-option 
              v-for="occupation in occupationOptions" 
              :key="occupation.id" 
              :label="occupation.name" 
              :value="occupation.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="已批准" :value="2" />
            <el-option label="已拒绝" :value="3" />
            <el-option label="进行中" :value="4" />
            <el-option label="已完成" :value="5" />
            <el-option label="已取消" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="dateRange.startDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleStartDateChange"
          />
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

    <!-- 数据表格 -->
    <el-card v-loading="loading" class="table-container" shadow="hover">
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="index" width="50" />
        <el-table-column prop="title" label="需求标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="projectName" label="所属项目" min-width="120" show-overflow-tooltip />
        <el-table-column prop="occupationName" label="工种" min-width="100" />
        <el-table-column prop="requiredCount" label="需求人数" width="100" align="center" />
        <el-table-column prop="dailyWage" label="日薪" width="100" align="center">
          <template #default="scope">
            {{ formatCurrency(scope.row.dailyWage) }}
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleDetail(scope.row)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              type="success" 
              link 
              size="small" 
              @click="handleSubmit(scope.row)"
            >
              提交
            </el-button>
            <el-button 
              v-if="[0, 3].includes(scope.row.status)" 
              type="primary" 
              link 
              size="small" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="[0, 3, 6].includes(scope.row.status)" 
              type="danger" 
              link 
              size="small" 
              @click="handleDelete(scope.row)"
            >
              删除
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

    <!-- 需求详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="劳务需求详情"
      size="40%"
      :destroy-on-close="true"
    >
      <div v-if="currentDemand" class="demand-details">
        <div class="demand-detail-header">
          <h2>{{ currentDemand.title }}</h2>
          <el-tag :type="getStatusType(currentDemand.status)">
            {{ formatStatus(currentDemand.status) }}
          </el-tag>
        </div>

        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="所属项目">{{ currentDemand.projectName }}</el-descriptions-item>
          <el-descriptions-item label="工种">{{ currentDemand.occupationName }}</el-descriptions-item>
          <el-descriptions-item label="工种类别">{{ currentDemand.occupationCategoryName }}</el-descriptions-item>
          <el-descriptions-item label="需求人数">{{ currentDemand.requiredCount }} 人</el-descriptions-item>
          <el-descriptions-item label="日薪">{{ formatCurrency(currentDemand.dailyWage) }}</el-descriptions-item>
          <el-descriptions-item label="总预算">{{ formatCurrency(currentDemand.totalBudget) }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentDemand.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentDemand.endDate }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentDemand.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDemand.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="需求描述">{{ currentDemand.description || '无' }}</el-descriptions-item>
          <el-descriptions-item label="岗位要求">{{ currentDemand.requirements || '无' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentDemand.createdByName }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDemand.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后更新时间">{{ currentDemand.updateTime || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDemand.status >= 2" label="审批人">
            {{ currentDemand.approvedByName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDemand.status >= 2" label="审批时间">
            {{ currentDemand.approvedTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDemand.status === 3" label="拒绝原因">
            {{ currentDemand.rejectReason || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button-group v-if="currentDemand.status === 0">
            <el-button type="success" @click="handleSubmit(currentDemand)">提交审核</el-button>
            <el-button type="primary" @click="handleEdit(currentDemand)">编辑</el-button>
            <el-button type="danger" @click="handleDelete(currentDemand)">删除</el-button>
          </el-button-group>
          <el-button-group v-if="currentDemand.status === 3">
            <el-button type="primary" @click="handleEdit(currentDemand)">编辑</el-button>
            <el-button type="danger" @click="handleDelete(currentDemand)">删除</el-button>
          </el-button-group>
          <el-button-group v-if="currentDemand.status === 6">
            <el-button type="danger" @click="handleDelete(currentDemand)">删除</el-button>
          </el-button-group>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新增/编辑需求对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑劳务需求' : '新增劳务需求'"
      width="650px"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入需求标题" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择项目" filterable style="width: 100%">
            <el-option 
              v-for="project in projectOptions" 
              :key="project.id" 
              :label="project.name" 
              :value="project.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工种" prop="occupationId">
          <el-select v-model="form.occupationId" placeholder="请选择工种" filterable style="width: 100%">
            <el-option 
              v-for="occupation in occupationOptions" 
              :key="occupation.id" 
              :label="occupation.name" 
              :value="occupation.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="需求人数" prop="requiredCount">
          <el-input-number v-model="form.requiredCount" :min="1" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日薪(元)" prop="dailyWage">
          <el-input-number v-model="form.dailyWage" :min="0" :precision="0" :step="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="需求描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入需求描述" 
          />
        </el-form-item>
        <el-form-item label="岗位要求" prop="requirements">
          <el-input 
            v-model="form.requirements" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入岗位要求" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            v-if="!isEdit || form.status === 0" 
            type="primary" 
            @click="saveAsDraft" 
            :loading="submitting.draft"
          >
            保存为草稿
          </el-button>
          <el-button type="success" @click="submitForm" :loading="submitting.submit">
            {{ isEdit ? '保存并提交' : '提交审核' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  Plus,
  Search,
  Delete,
  Refresh,
  View
} from '@element-plus/icons-vue'
import { 
  getLaborDemandInfo, 
  addLaborDemand,
  updateLaborDemand,
  updateLaborDemandStatus,
  deleteLaborDemand,
  getCompanyLaborDemandList,
  searchLaborDemand
} from '@/api/labor'
import { getProjectList } from '@/api/project'
import { getOccupationPage } from '@/api/occupation'
import { useCompanyStore } from '@/stores/company'
import type { LaborDemand, LaborDemandListItem, LaborDemandStatus, AddLaborDemandParams, UpdateLaborDemandParams } from '@/types/labor'

// 格式化货币
const formatCurrency = (value: number) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
    .format(value)
    .replace(/\.00$/, '')
}

// 格式化状态
const formatStatus = (status: LaborDemandStatus) => {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '待审核',
    2: '已批准',
    3: '已拒绝',
    4: '进行中',
    5: '已完成',
    6: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态对应的类型
const getStatusType = (status: LaborDemandStatus) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'primary',
    5: 'success',
    6: 'info'
  }
  return typeMap[status] || ''
}

// 加载状态
const loading = ref(false)
const submitting = reactive({
  draft: false,
  submit: false
})

// 表格数据
const tableData = ref<LaborDemandListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  projectId: undefined as number | undefined,
  occupationId: undefined as number | undefined,
  status: undefined as LaborDemandStatus | undefined,
  startDateBegin: undefined as string | undefined,
  startDateEnd: undefined as string | undefined,
  endDateBegin: undefined as string | undefined,
  endDateEnd: undefined as string | undefined
})

// 日期范围
const dateRange = reactive({
  startDate: [] as string[],
  endDate: [] as string[]
})

// 处理开始日期范围变化
const handleStartDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    searchForm.startDateBegin = dates[0]
    searchForm.startDateEnd = dates[1]
  } else {
    searchForm.startDateBegin = undefined
    searchForm.startDateEnd = undefined
  }
}

// 处理结束日期范围变化
const handleEndDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    searchForm.endDateBegin = dates[0]
    searchForm.endDateEnd = dates[1]
  } else {
    searchForm.endDateBegin = undefined
    searchForm.endDateEnd = undefined
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  // 重置搜索表单
  searchForm.keyword = ''
  searchForm.projectId = undefined
  searchForm.occupationId = undefined
  searchForm.status = undefined
  searchForm.startDateBegin = undefined
  searchForm.startDateEnd = undefined
  searchForm.endDateBegin = undefined
  searchForm.endDateEnd = undefined
  
  // 重置日期选择器
  dateRange.startDate = []
  dateRange.endDate = []
  
  // 重新加载数据
  currentPage.value = 1
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const companyStore = useCompanyStore()
    const companyId = companyStore.companyId
    
    if (!companyId) {
      throw new Error('无法获取企业信息')
    }
    
    // 如果有搜索条件，使用搜索接口
    if (
      searchForm.keyword || 
      searchForm.projectId !== undefined || 
      searchForm.occupationId !== undefined || 
      searchForm.status !== undefined ||
      searchForm.startDateBegin ||
      searchForm.startDateEnd
    ) {
      const params = {
        ...searchForm,
        companyId: companyId,
        page: currentPage.value,
        size: pageSize.value
      }
      
      const res = await searchLaborDemand(params)
      if (res.code === 0 && res.data) {
        tableData.value = res.data.list
        total.value = res.data.total
      } else {
        throw new Error(res.message || '获取劳务需求列表失败')
      }
    } else {
      // 否则使用企业劳务需求列表接口
      const res = await getCompanyLaborDemandList(companyId)
      if (res.code === 0 && res.data) {
        tableData.value = res.data
        total.value = res.data.length
      } else {
        throw new Error(res.message || '获取劳务需求列表失败')
      }
    }
  } catch (error: any) {
    console.error('获取劳务需求列表失败', error)
    ElMessage.error(error.message || '获取劳务需求列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchData()
}

// 选项数据
const projectOptions = ref<{ id: number; name: string }[]>([])
const occupationOptions = ref<{ id: number; name: string }[]>([])

// 获取当前企业的项目列表
const fetchProjectList = async () => {
  try {
    const companyStore = useCompanyStore()
    const companyId = companyStore.companyId
    
    if (!companyId) {
      throw new Error('无法获取企业信息')
    }
    
    const res = await getProjectList({
      companyId: companyId,
      page: 1,
      size: 1000 // 获取所有项目，用于下拉选择
    })
    
    projectOptions.value = (res.data.list || []).map((item: any) => ({
      id: item.id,
      name: item.name
    }))
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

// 获取工种列表
const fetchOccupationList = async () => {
  try {
    const res = await getOccupationPage({
      page: 1,
      size: 1000 // 获取所有工种，用于下拉选择
    })
    occupationOptions.value = (res.data.records || []).map((item: any) => ({
      id: item.id,
      name: item.name
    }))
  } catch (error) {
    console.error('获取工种列表失败', error)
  }
}

// 详情抽屉
const drawerVisible = ref(false)
const currentDemand = ref<LaborDemand | null>(null)

// 查看详情
const handleDetail = async (row: LaborDemandListItem) => {
  try {
    const res = await getLaborDemandInfo(row.id)
    if (res.code === 0 && res.data) {
      currentDemand.value = res.data
      drawerVisible.value = true
    } else {
      throw new Error(res.message || '获取劳务需求详情失败')
    }
  } catch (error: any) {
    console.error('获取劳务需求详情失败', error)
    ElMessage.error(error.message || '获取劳务需求详情失败，请稍后再试')
  }
}

// 编辑对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<{
  id?: number
  title: string
  projectId: number | undefined
  occupationId: number | undefined
  requiredCount: number
  dailyWage: number
  startDate: string
  endDate: string
  contactPerson: string
  contactPhone: string
  description: string
  requirements: string
  status?: LaborDemandStatus
}>({
  title: '',
  projectId: undefined,
  occupationId: undefined,
  requiredCount: 1,
  dailyWage: 300,
  startDate: '',
  endDate: '',
  contactPerson: '',
  contactPhone: '',
  description: '',
  requirements: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  occupationId: [
    { required: true, message: '请选择工种', trigger: 'change' }
  ],
  requiredCount: [
    { required: true, message: '请输入需求人数', trigger: 'blur' }
  ],
  dailyWage: [
    { required: true, message: '请输入日薪', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { max: 20, message: '长度不能超过20个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
  ],
  requirements: [
    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
  ]
}

// 添加需求
const handleAdd = () => {
  isEdit.value = false
  form.title = ''
  form.projectId = undefined
  form.occupationId = undefined
  form.requiredCount = 1
  form.dailyWage = 300
  form.startDate = ''
  form.endDate = ''
  form.contactPerson = ''
  form.contactPhone = ''
  form.description = ''
  form.requirements = ''
  form.status = undefined
  
  dialogVisible.value = true
}

// 编辑需求
const handleEdit = async (row: LaborDemandListItem | LaborDemand) => {
  isEdit.value = true
  
  try {
    // 如果传入的是列表项，需要先获取详情
    if (!('requirements' in row)) {
      const res = await getLaborDemandInfo(row.id)
      if (res.code === 0 && res.data) {
        setFormData(res.data)
      } else {
        throw new Error(res.message || '获取劳务需求详情失败')
      }
    } else {
      // 直接使用传入的详情数据
      setFormData(row as LaborDemand)
    }
    
    dialogVisible.value = true
    drawerVisible.value = false
  } catch (error: any) {
    console.error('获取劳务需求详情失败', error)
    ElMessage.error(error.message || '获取劳务需求详情失败，请稍后再试')
  }
}

// 设置表单数据
const setFormData = (demand: LaborDemand) => {
  form.id = demand.id
  form.title = demand.title
  form.projectId = demand.projectId
  form.occupationId = demand.occupationId
  form.requiredCount = demand.requiredCount
  form.dailyWage = demand.dailyWage
  form.startDate = demand.startDate
  form.endDate = demand.endDate
  form.contactPerson = demand.contactPerson
  form.contactPhone = demand.contactPhone
  form.description = demand.description
  form.requirements = demand.requirements
  form.status = demand.status
}

// 保存为草稿
const saveAsDraft = async () => {
  if (!formRef.value) return
  
  try {
    submitting.draft = true
    
    if (isEdit.value && form.id) {
      // 更新需求
      const updateParams: UpdateLaborDemandParams = {
        id: form.id,
        title: form.title,
        occupationId: form.occupationId,
        requiredCount: form.requiredCount,
        dailyWage: form.dailyWage,
        startDate: form.startDate,
        endDate: form.endDate,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        description: form.description,
        requirements: form.requirements
      }
      
      await updateLaborDemand(updateParams)
      ElMessage.success('已更新劳务需求草稿')
    } else {
      // 添加需求
      if (!form.projectId || !form.occupationId) {
        ElMessage.warning('请选择项目和工种')
        submitting.draft = false
        return
      }
      
      const addParams: AddLaborDemandParams = {
        projectId: form.projectId,
        title: form.title,
        occupationId: form.occupationId,
        requiredCount: form.requiredCount,
        dailyWage: form.dailyWage,
        startDate: form.startDate,
        endDate: form.endDate,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        description: form.description,
        requirements: form.requirements
      }
      
      await addLaborDemand(addParams)
      ElMessage.success('已保存劳务需求草稿')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '保存草稿失败，请稍后再试')
  } finally {
    submitting.draft = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        submitting.submit = true
        
        if (isEdit.value && form.id) {
          // 更新需求
          const updateParams: UpdateLaborDemandParams = {
            id: form.id,
            title: form.title,
            occupationId: form.occupationId,
            requiredCount: form.requiredCount,
            dailyWage: form.dailyWage,
            startDate: form.startDate,
            endDate: form.endDate,
            contactPerson: form.contactPerson,
            contactPhone: form.contactPhone,
            description: form.description,
            requirements: form.requirements
          }
          
          await updateLaborDemand(updateParams)
          
          // 如果是草稿状态，提交审核
          if (form.status === 0) {
            await updateLaborDemandStatus({ id: form.id, status: 1 })
          }
          
          ElMessage.success('已更新并提交劳务需求')
        } else {
          // 添加需求并提交审核
          if (!form.projectId || !form.occupationId) {
            throw new Error('请选择项目和工种')
          }
          
          const addParams: AddLaborDemandParams = {
            projectId: form.projectId,
            title: form.title,
            occupationId: form.occupationId,
            requiredCount: form.requiredCount,
            dailyWage: form.dailyWage,
            startDate: form.startDate,
            endDate: form.endDate,
            contactPerson: form.contactPerson,
            contactPhone: form.contactPhone,
            description: form.description,
            requirements: form.requirements
          }
          
          const res = await addLaborDemand(addParams)
          
          // 提交审核
          if (res.code === 0 && res.data) {
            await updateLaborDemandStatus({ id: res.data.id, status: 1 })
          }
          
          ElMessage.success('已提交劳务需求')
        }
        
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || '提交失败，请稍后再试')
      } finally {
        submitting.submit = false
      }
    }
  })
}

// 提交草稿需求
const handleSubmit = async (row: LaborDemandListItem | LaborDemand) => {
  ElMessageBox.confirm(
    '确定要提交此劳务需求进行审核吗？',
    '提交确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      await updateLaborDemandStatus({ id: row.id, status: 1 })
      ElMessage.success('已提交审核')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '提交失败，请稍后再试')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 删除需求
const handleDelete = (row: LaborDemandListItem | LaborDemand) => {
  ElMessageBox.confirm(
    `确定要删除"${row.title}"吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteLaborDemand(row.id)
      ElMessage.success('删除成功')
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败，请稍后再试')
    }
  }).catch(() => {
    // 用户取消操作
  })
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

// 验证企业信息
const companyStore = useCompanyStore()
const hasCompanyInfo = computed(() => !!companyStore.companyId)

// 初始化数据
onMounted(async () => {
  // 确保有企业信息
  if (!hasCompanyInfo.value) {
    try {
      await companyStore.fetchCompanyInfo()
      if (!companyStore.companyId) {
        ElMessage.error('无法获取企业信息，请刷新页面重试')
        return
      }
    } catch (error) {
      ElMessage.error('获取企业信息失败，请刷新页面重试')
      return
    }
  }
  
  // 加载下拉选项数据
  await fetchProjectList()
  await fetchOccupationList()
  
  // 加载劳务需求列表
  fetchData()
})
</script>

<style scoped>
.labor-demands-container {
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

.table-container {
  margin-bottom: 24px;
  min-height: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.demand-details {
  padding: 0 20px;
}

.demand-detail-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #ebeef5;
}

.demand-detail-header h2 {
  margin: 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.detail-descriptions {
  margin: 20px 0;
}

.drawer-footer {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 