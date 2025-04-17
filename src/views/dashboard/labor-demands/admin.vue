<template>
  <div class="labor-demands-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">劳务需求管理</h2>
        <span class="subtitle">系统管理员视图 - 管理所有企业的劳务需求</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleCreateDemand">
          <el-icon><Plus /></el-icon>创建需求
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
            <el-dropdown trigger="click" @command="(command) => handleOperationCommand(command, scope.row)">
              <el-button link type="primary" size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.status === 1" command="approve">批准</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 1" command="reject">拒绝</el-dropdown-item>
                  <el-dropdown-item divided command="details-new">新API查看</el-dropdown-item>
                  <el-dropdown-item command="status-open">设为开放中</el-dropdown-item>
                  <el-dropdown-item command="status-filled">设为已满</el-dropdown-item>
                  <el-dropdown-item command="status-canceled">设为已取消</el-dropdown-item>
                  <el-dropdown-item command="status-expired">设为已过期</el-dropdown-item>
                  <el-dropdown-item divided command="delete" style="color: #F56C6C;">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
    
    <!-- 新API需求详情抽屉 -->
    <el-drawer
      v-model="drawerVisibleNew"
      title="劳务需求详情（新API）"
      size="40%"
      :destroy-on-close="true"
    >
      <div v-if="currentDemandNew" class="demand-details">
        <div class="demand-detail-header">
          <h2>项目: {{ currentDemandNew.projectName }}</h2>
          <el-tag :type="getNewStatusType(currentDemandNew.status)">
            {{ formatNewStatus(currentDemandNew.status) }}
          </el-tag>
        </div>

        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="项目ID">{{ currentDemandNew.projectId }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ currentDemandNew.projectName }}</el-descriptions-item>
          <el-descriptions-item label="工种ID">{{ currentDemandNew.jobTypeId }}</el-descriptions-item>
          <el-descriptions-item label="工种名称">{{ currentDemandNew.jobTypeName }}</el-descriptions-item>
          <el-descriptions-item label="需求人数">{{ currentDemandNew.headcount }} 人</el-descriptions-item>
          <el-descriptions-item label="日薪">{{ formatCurrency(currentDemandNew.dailyWage) }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentDemandNew.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentDemandNew.endDate }}</el-descriptions-item>
          <el-descriptions-item label="工作时间">{{ currentDemandNew.workHours }}</el-descriptions-item>
          <el-descriptions-item label="岗位要求">{{ currentDemandNew.requirements || '无' }}</el-descriptions-item>
          <el-descriptions-item label="提供住宿">{{ currentDemandNew.accommodation ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="提供餐食">{{ currentDemandNew.meals ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDemandNew.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后更新时间">{{ currentDemandNew.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button-group>
            <el-button type="success" @click="handleStatusChange(currentDemandNew.id, LaborDemandStatusString.Open)">
              设为开放中
            </el-button>
            <el-button type="info" @click="handleStatusChange(currentDemandNew.id, LaborDemandStatusString.Filled)">
              设为已满
            </el-button>
            <el-button type="danger" @click="handleStatusChange(currentDemandNew.id, LaborDemandStatusString.Canceled)">
              设为已取消
            </el-button>
            <el-button type="warning" @click="handleStatusChange(currentDemandNew.id, LaborDemandStatusString.Expired)">
              设为已过期
            </el-button>
          </el-button-group>
          <el-button @click="drawerVisibleNew = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 创建劳务需求对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建劳务需求"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        label-width="100px"
      >
        <el-form-item label="企业" prop="companyId">
          <el-select v-model="createForm.companyId" placeholder="请选择企业" clearable>
            <el-option 
              v-for="company in companyOptions" 
              :key="company.id" 
              :label="company.name" 
              :value="company.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目" prop="projectId">
          <el-select 
            v-model="createForm.projectId" 
            placeholder="请选择项目" 
            clearable
            :disabled="!createForm.companyId"
          >
            <el-option 
              v-for="project in projectOptions" 
              :key="project.id" 
              :label="project.name" 
              :value="project.id" 
            />
          </el-select>
          <div v-if="!createForm.companyId" class="form-tip">请先选择企业</div>
        </el-form-item>
        <el-form-item label="工种" prop="jobTypeId">
          <el-select v-model="createForm.jobTypeId" placeholder="请选择工种" clearable>
            <el-option 
              v-for="occupation in occupationOptions" 
              :key="occupation.id" 
              :label="occupation.name" 
              :value="occupation.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="需求人数" prop="headcount">
          <el-input 
            v-model="createForm.headcount" 
            type="number"
            min="1"
            placeholder="请输入需求人数" 
            @input="handleNumberInput($event, 'headcount')"
          />
        </el-form-item>
        <el-form-item label="日薪" prop="dailyWage">
          <el-input 
            v-model="createForm.dailyWage" 
            type="number"
            min="0"
            placeholder="请输入日薪" 
            @input="handleNumberInput($event, 'dailyWage')"
          />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="createForm.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="createForm.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="工作时间" prop="workHours">
          <el-input v-model="createForm.workHours" placeholder="请输入工作时间" />
        </el-form-item>
        <el-form-item label="岗位要求" prop="requirements">
          <el-input v-model="createForm.requirements" type="textarea" placeholder="请输入岗位要求" />
        </el-form-item>
        <el-form-item label="提供住宿">
          <el-switch v-model="createForm.accommodation" />
        </el-form-item>
        <el-form-item label="提供餐食">
          <el-switch v-model="createForm.meals" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateForm" :loading="submitting">
            确认创建
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
  View,
  ArrowDown,
  Plus
} from '@element-plus/icons-vue'
import { 
  getLaborDemandList, 
  getLaborDemandInfo, 
  approveLaborDemand,
  searchLaborDemand
} from '@/api/labor'
import {
  getLaborDemandById,
  changeLaborDemandStatus,
  removeLaborDemand,
  createLaborDemand
} from '@/api/laborDemand'
import { getCompanyProjectList } from '@/api/project'
import { getCompanyList } from '@/api/company'
import { getProjectList } from '@/api/project'
import { getOccupationPage } from '@/api/occupation'
import type { 
  LaborDemand, 
  LaborDemandListItem, 
  LaborDemandStatus, 
  LaborDemandDetail,
  LaborDemandStatusString
} from '@/types/labor'

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

// 测试新API
const testNewApi = async () => {
  try {
    // 尝试获取第一个劳务需求的详情，测试新API是否可用
    const firstRow = tableData.value[0]
    if (firstRow) {
      console.log('测试新API: 尝试获取劳务需求详情', firstRow.id)
      const res = await getLaborDemandById(firstRow.id)
      console.log('新API响应:', res)
      if (res.code === 0) {
        ElMessage.success('新的劳务需求API可用')
        return true
      }
    }
  } catch (error) {
    console.error('新API测试失败:', error)
    return false
  }
  return false
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
const drawerVisibleNew = ref(false)
const currentDemand = ref<LaborDemand | null>(null)
const currentDemandNew = ref<LaborDemandDetail | null>(null)

// 查看详情 (使用原有API)
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

// 查看详情 (使用新API)
const handleDetailNew = async (id: number) => {
  try {
    const res = await getLaborDemandById(id)
    if (res.code === 0 && res.data) {
      currentDemandNew.value = res.data
      drawerVisibleNew.value = true
    } else {
      throw new Error(res.message || '获取劳务需求详情失败')
    }
  } catch (error: any) {
    console.error('获取劳务需求详情失败', error)
    ElMessage.error(error.message || '获取劳务需求详情失败，请稍后再试')
  }
}

// 修改劳务需求状态 (使用新API)
const handleStatusChange = async (id: number, status: LaborDemandStatusString) => {
  try {
    const confirmMessage = `确定要将此劳务需求状态改为"${formatNewStatus(status)}"吗？`
    
    await ElMessageBox.confirm(
      confirmMessage,
      '修改状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    submitting.value = true
    const res = await changeLaborDemandStatus({ id, status })
    
    if (res.code === 0) {
      ElMessage.success(`状态已更新为"${formatNewStatus(status)}"`)
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
      fetchData()
    } else {
      throw new Error(res.message || '更新状态失败')
    }
  } catch (error: any) {
    if (error === 'cancel') return
    console.error('修改状态失败', error)
    ElMessage.error(error.message || '修改状态失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

// 删除劳务需求 (使用新API)
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此劳务需求吗？此操作不可恢复！',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    submitting.value = true
    const res = await removeLaborDemand(id)
    
    if (res.code === 0 && res.data) {
      ElMessage.success('劳务需求已删除')
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
      fetchData()
    } else {
      throw new Error(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error === 'cancel') return
    console.error('删除劳务需求失败', error)
    ElMessage.error(error.message || '删除失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

// 格式化新API的状态
const formatNewStatus = (status: LaborDemandStatusString) => {
  const statusMap: Record<string, string> = {
    [LaborDemandStatusString.Open]: '开放中',
    [LaborDemandStatusString.Filled]: '已满',
    [LaborDemandStatusString.Canceled]: '已取消',
    [LaborDemandStatusString.Expired]: '已过期'
  }
  return statusMap[status] || '未知状态'
}

// 获取新API状态对应的类型
const getNewStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [LaborDemandStatusString.Open]: 'success',
    [LaborDemandStatusString.Filled]: 'info',
    [LaborDemandStatusString.Canceled]: 'danger',
    [LaborDemandStatusString.Expired]: 'warning'
  }
  return typeMap[status] || ''
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

// 处理dropdown操作
const handleOperationCommand = (command: string, row: LaborDemandListItem) => {
  switch (command) {
    case 'approve':
      handleApprove(row, true)
      break
    case 'reject':
      handleApprove(row, false)
      break
    case 'details-new':
      handleDetailNew(row.id)
      break
    case 'status-open':
      handleStatusChange(row.id, LaborDemandStatusString.Open)
      break
    case 'status-filled':
      handleStatusChange(row.id, LaborDemandStatusString.Filled)
      break
    case 'status-canceled':
      handleStatusChange(row.id, LaborDemandStatusString.Canceled)
      break
    case 'status-expired':
      handleStatusChange(row.id, LaborDemandStatusString.Expired)
      break
    case 'delete':
      handleDelete(row.id)
      break
    default:
      console.warn('未知操作:', command)
  }
}

// 创建劳务需求对话框
const createDialogVisible = ref(false)
const createForm = reactive<Partial<{
  companyId: number
  projectId: number
  jobTypeId: number
  headcount: number | string
  dailyWage: number | string
  startDate: string
  endDate: string
  workHours: string
  requirements: string
  accommodation: boolean
  meals: boolean
}>>({
  companyId: undefined,
  projectId: undefined,
  jobTypeId: undefined,
  headcount: '',
  dailyWage: '',
  startDate: '',
  endDate: '',
  workHours: '8:00-18:00',
  requirements: '',
  accommodation: false,
  meals: false
})

// 验证日期范围
const validateEndDate = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请选择结束日期'))
  } else if (createForm.startDate && new Date(value) < new Date(createForm.startDate)) {
    callback(new Error('结束日期不能早于开始日期'))
  } else {
    callback()
  }
}

// 验证需求人数
const validateHeadcount = (rule: any, value: string | number, callback: Function) => {
  if (value === '' || value === undefined) {
    callback(new Error('请输入需求人数'))
  } else {
    const numValue = Number(value)
    if (isNaN(numValue)) {
      callback(new Error('请输入有效数字'))
    } else if (numValue <= 0) {
      callback(new Error('需求人数必须大于0'))
    } else {
      callback()
    }
  }
}

// 验证日薪
const validateDailyWage = (rule: any, value: string | number, callback: Function) => {
  if (value === '' || value === undefined) {
    callback(new Error('请输入日薪'))
  } else {
    const numValue = Number(value)
    if (isNaN(numValue)) {
      callback(new Error('请输入有效数字'))
    } else if (numValue < 0) {
      callback(new Error('日薪不能为负数'))
    } else {
      callback()
    }
  }
}

// 表单校验规则
const createFormRules = {
  companyId: [{ required: true, message: '请选择企业', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  jobTypeId: [{ required: true, message: '请选择工种', trigger: 'change' }],
  headcount: [
    { required: true, message: '请输入需求人数', trigger: 'blur' },
    { validator: validateHeadcount, trigger: 'blur' }
  ],
  dailyWage: [
    { required: true, message: '请输入日薪', trigger: 'blur' },
    { validator: validateDailyWage, trigger: 'blur' }
  ],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    { validator: validateEndDate, trigger: 'change' }
  ],
  workHours: [{ required: true, message: '请输入工作时间', trigger: 'blur' }]
}

// 创建表单引用
const createFormRef = ref()

// 打开创建对话框
const handleCreateDemand = () => {
  // 重置表单
  Object.assign(createForm, {
    companyId: undefined,
    projectId: undefined,
    jobTypeId: undefined,
    headcount: '',
    dailyWage: '',
    startDate: '',
    endDate: '',
    workHours: '8:00-18:00',
    requirements: '',
    accommodation: false,
    meals: false
  })
  createDialogVisible.value = true
}

// 提交创建表单
const submitCreateForm = async () => {
  if (!createFormRef.value) return
  
  await createFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        submitting.value = true
        
        // 转换表单数据，确保数字字段是数字类型
        const formData = {
          ...createForm,
          companyId: Number(createForm.companyId),
          projectId: Number(createForm.projectId),
          jobTypeId: Number(createForm.jobTypeId),
          headcount: Number(createForm.headcount),
          dailyWage: Number(createForm.dailyWage)
        }
        
        // 调用新API创建劳务需求
        const res = await createLaborDemand(formData as any)
        
        if (res.code === 0) {
          ElMessage.success('劳务需求创建成功')
          createDialogVisible.value = false
          fetchData() // 刷新列表
        } else {
          throw new Error(res.message || '创建失败')
        }
      } catch (error: any) {
        console.error('创建劳务需求失败', error)
        ElMessage.error(error.message || '创建失败，请稍后再试')
      } finally {
        submitting.value = false
      }
    } else {
      ElMessage.warning('请完善表单信息')
      return false
    }
  })
}

// 监听开始日期变化，验证结束日期
watch(
  () => createForm.startDate,
  (newStartDate) => {
    // 如果开始日期存在且晚于结束日期，重置结束日期
    if (newStartDate && createForm.endDate && new Date(newStartDate) > new Date(createForm.endDate)) {
      createForm.endDate = ''
      ElMessage.warning('结束日期不能早于开始日期')
    }
  }
)

// 监听创建表单中的企业选择变化
watch(
  () => createForm.companyId,
  (newCompanyId) => {
    // 重置项目选择
    createForm.projectId = undefined
    
    // 如果选择了企业，加载该企业的项目
    if (newCompanyId) {
      fetchProjectListForCompany(newCompanyId)
    }
  }
)

// 获取指定企业的项目列表
const fetchProjectListForCompany = async (companyId: number) => {
  try {
    // 使用getCompanyProjectList获取指定企业的项目
    const res = await getCompanyProjectList({
      companyId: companyId,
      pageNum: 1,
      pageSize: 1000 // 获取所有项目，用于下拉选择
    })
    
    // 处理API响应
    if (Array.isArray(res.data)) {
      projectOptions.value = res.data.map((item: any) => ({
        id: item.id,
        name: item.name
      }))
    } else if (res.data && Array.isArray(res.data.list)) {
      projectOptions.value = res.data.list.map((item: any) => ({
        id: item.id,
        name: item.name
      }))
    } else {
      projectOptions.value = []
    }
  } catch (error) {
    console.error('获取企业项目列表失败', error)
    ElMessage.error('获取企业项目列表失败，请稍后再试')
    projectOptions.value = []
  }
}

// 处理数字输入
const handleNumberInput = (value: string, field: 'headcount' | 'dailyWage') => {
  // 将输入的值转为数字
  const numValue = Number(value)
  
  // 如果是NaN，置为空字符串
  if (isNaN(numValue)) {
    createForm[field] = ''
    return
  }
  
  // 处理负数
  if (field === 'headcount' && numValue <= 0) {
    createForm[field] = ''
    ElMessage.warning('需求人数必须大于0')
  } else if (field === 'dailyWage' && numValue < 0) {
    createForm[field] = ''
    ElMessage.warning('日薪不能为负数')
  }
}

// 初始化
onMounted(async () => {
  fetchCompanyList()
  fetchProjectList()
  fetchOccupationList()
  await fetchData()
  
  // 测试新API是否可用
  const newApiAvailable = await testNewApi()
  if (newApiAvailable) {
    console.log('新API可用，可以使用新的功能')
  } else {
    console.log('新API不可用，使用原有功能')
  }
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

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style> 