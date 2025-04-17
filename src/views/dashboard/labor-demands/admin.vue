<template>
  <div class="labor-demands-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">劳务需求管理</h2>
        <span class="subtitle">系统管理员视图 - 管理所有企业的劳务需求</span>
      </div>
      <div class="actions-section">
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
        <el-form-item label="所属企业">
          <el-select v-model="searchForm.companyId" placeholder="请选择企业" clearable filterable>
            <el-option 
              v-for="company in companyOptions" 
              :key="company.id" 
              :label="company.name" 
              :value="company.id" 
            />
          </el-select>
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
        <el-table-column prop="companyName" label="所属企业" min-width="120" show-overflow-tooltip />
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleDetail(scope.row)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              type="success" 
              link 
              size="small" 
              @click="handleApprove(scope.row, true)"
            >
              批准
            </el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              type="danger" 
              link 
              size="small" 
              @click="handleApprove(scope.row, false)"
            >
              拒绝
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
          <el-descriptions-item label="所属企业">{{ currentDemand.companyName }}</el-descriptions-item>
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
          <el-button-group v-if="currentDemand.status === 1">
            <el-button type="success" @click="handleApprove(currentDemand, true)">批准</el-button>
            <el-button type="danger" @click="handleApprove(currentDemand, false)">拒绝</el-button>
          </el-button-group>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="请输入拒绝原因"
      width="500px"
    >
      <el-form :model="rejectForm">
        <el-form-item label="拒绝原因" :label-width="'80px'">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入拒绝该劳务需求的原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject" :loading="submitting">
            确认拒绝
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Delete,
  Refresh,
  View
} from '@element-plus/icons-vue'
import { 
  getLaborDemandList, 
  getLaborDemandInfo, 
  approveLaborDemand,
  searchLaborDemand
} from '@/api/labor'
import { getCompanyProjectList } from '@/api/project'
import { getCompanyList } from '@/api/company'
import { getProjectList } from '@/api/project'
import { getOccupationPage } from '@/api/occupation'
import type { LaborDemand, LaborDemandListItem, LaborDemandStatus } from '@/types/labor'

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
const submitting = ref(false)

// 表格数据
const tableData = ref<LaborDemandListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  companyId: undefined as number | undefined,
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
  searchForm.companyId = undefined
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
    const params = {
      ...searchForm,
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
const companyOptions = ref<{ id: number; name: string }[]>([])
const projectOptions = ref<{ id: number; name: string }[]>([])
const occupationOptions = ref<{ id: number; name: string }[]>([])

// 获取企业列表
const fetchCompanyList = async () => {
  try {
    const res = await getCompanyList({
      current: 1,
      size: 1000 // 获取所有企业，用于下拉选择
    })
    companyOptions.value = (res.data.records || []).map((item: any) => ({
      id: item.id,
      name: item.name
    }))
  } catch (error) {
    console.error('获取企业列表失败', error)
  }
}

// 获取项目列表
const fetchProjectList = async (companyId?: number) => {
  try {
    if (!companyId) {
      // 如果没有选择企业，清空项目列表
      projectOptions.value = []
      return
    }
    
    // 使用getCompanyProjectList获取指定企业的项目
    const res = await getCompanyProjectList({
      companyId: companyId,
      pageNum: 1,
      pageSize: 1000 // 获取所有项目，用于下拉选择
    })
    
    // 输出API响应结构以便调试
    console.log('项目列表API响应:', res)
    
    // 根据用户提供的API响应示例调整数据映射
    // API返回的数据是一个数组，直接在data字段内
    if (Array.isArray(res.data)) {
      projectOptions.value = res.data.map((item: any) => ({
        id: item.id,
        name: item.name
      }))
    } else if (res.data && Array.isArray(res.data.list)) {
      // 兼容如果有list字段的情况
      projectOptions.value = res.data.list.map((item: any) => ({
        id: item.id,
        name: item.name
      }))
    } else {
      projectOptions.value = []
    }
  } catch (error) {
    console.error('获取项目列表失败', error)
    projectOptions.value = []
  }
}

// 监听公司选择变化，更新项目列表
watch(
  () => searchForm.companyId,
  (newCompanyId) => {
    // 当公司选择变化时，重新获取该公司的项目列表
    fetchProjectList(newCompanyId)
    
    // 清空已选择的项目，因为公司变了，项目也需要重新选择
    searchForm.projectId = undefined
  }
)

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

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  id: 0,
  reason: ''
})

// 处理审批
const handleApprove = (row: LaborDemandListItem | LaborDemand, approved: boolean) => {
  if (approved) {
    // 直接批准
    ElMessageBox.confirm(
      '确定要批准此劳务需求吗？',
      '批准确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    ).then(async () => {
      try {
        submitting.value = true
        await approveLaborDemand(row.id, true)
        ElMessage.success('已批准该劳务需求')
        if (drawerVisible.value) {
          drawerVisible.value = false
        }
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || '批准失败，请稍后再试')
      } finally {
        submitting.value = false
      }
    }).catch(() => {
      // 用户取消操作
    })
  } else {
    // 显示拒绝原因对话框
    rejectForm.id = row.id
    rejectForm.reason = ''
    rejectDialogVisible.value = true
  }
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  try {
    submitting.value = true
    await approveLaborDemand(rejectForm.id, false, rejectForm.reason)
    ElMessage.success('已拒绝该劳务需求')
    rejectDialogVisible.value = false
    if (drawerVisible.value) {
      drawerVisible.value = false
    }
    fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '拒绝失败，请稍后再试')
  } finally {
    submitting.value = false
  }
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

// 初始化
onMounted(() => {
  fetchCompanyList()
  fetchProjectList()
  fetchOccupationList()
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

.filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style> 