<template>
  <div class="labor-demands-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">劳务需求管理</h2>
        <span class="subtitle">项目经理视图 - 管理您负责的项目的劳务需求</span>
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

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="我的项目劳务需求" name="myProjects">
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
                <el-option label="开放中" value="open" />
                <el-option label="已满" value="filled" />
                <el-option label="已取消" value="cancelled" />
                <el-option label="已过期" value="expired" />
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
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link size="small" @click="handleDetail(scope.row)">
                  <el-icon><View /></el-icon>查看
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'open'" 
                  type="success" 
                  link 
                  size="small" 
                  @click="handleSubmit(scope.row)"
                >
                  发布
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'filled'" 
                  type="primary" 
                  link 
                  size="small" 
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'cancelled'" 
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
      </el-tab-pane>

      <el-tab-pane label="进行中的需求" name="inProgress">
        <!-- 进行中的需求表格 -->
        <el-card v-loading="inProgressLoading" class="table-container" shadow="hover">
          <el-table :data="inProgressData" style="width: 100%" border stripe>
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
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link size="small" @click="handleDetail(scope.row)">
                  <el-icon><View /></el-icon>查看
                </el-button>
                <el-button 
                  type="success" 
                  link 
                  size="small" 
                  @click="handleComplete(scope.row)"
                >
                  标记完成
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

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
          <el-descriptions-item v-if="currentDemand.status === 'filled'" label="审批人">
            {{ currentDemand.approvedByName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDemand.status === 'filled'" label="审批时间">
            {{ currentDemand.approvedTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDemand.status === 'filled'" label="拒绝原因">
            {{ currentDemand.rejectReason || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button-group v-if="currentDemand.status === 'open'">
            <el-button type="success" @click="handleSubmit(currentDemand)">发布</el-button>
            <el-button type="primary" @click="handleEdit(currentDemand)">编辑</el-button>
            <el-button type="danger" @click="handleDelete(currentDemand)">删除</el-button>
          </el-button-group>
          <el-button-group v-if="currentDemand.status === 'filled'">
            <el-button type="primary" @click="handleEdit(currentDemand)">编辑</el-button>
            <el-button type="danger" @click="handleDelete(currentDemand)">删除</el-button>
          </el-button-group>
          <el-button-group v-if="currentDemand.status === 'cancelled'">
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
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入需求标题" />
        </el-form-item>
        <el-form-item label="工种" prop="jobTypeId">
          <el-select v-model="form.jobTypeId" placeholder="请选择工种" filterable style="width: 100%">
            <el-option 
              v-for="occupation in occupationOptions" 
              :key="occupation.id" 
              :label="occupation.name" 
              :value="occupation.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="需求人数" prop="headcount">
          <el-input-number v-model="form.headcount" :min="1" :precision="0" style="width: 100%" />
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
        <el-form-item label="工作时间" prop="workHours">
          <el-input v-model="form.workHours" placeholder="请输入工作时间，例如：8:00-17:00" />
        </el-form-item>
        <el-form-item label="岗位要求" prop="requirements">
          <el-input 
            v-model="form.requirements" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入岗位要求" 
          />
        </el-form-item>
        <el-form-item label="提供住宿">
          <el-switch v-model="form.accommodation" />
        </el-form-item>
        <el-form-item label="提供餐食">
          <el-switch v-model="form.meals" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting.submit">
            {{ isEdit ? '保存' : '创建' }}
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
  getProjectLaborDemandList,
  searchLaborDemand
} from '@/api/labor'
import {
  getLaborDemandById,
  changeLaborDemandStatus,
  removeLaborDemand,
  createLaborDemand,
  getLaborDemandPage,
  getLaborDemandsByProject,
  searchLaborDemands
} from '@/api/laborDemand'
import { getManagerProjectList } from '@/api/project'
import { getOccupationPage } from '@/api/occupation'
import type { 
  LaborDemand, 
  LaborDemandListItem, 
  LaborDemandStatus, 
  AddLaborDemandParams, 
  UpdateLaborDemandParams,
  LaborDemandListItemNew,
  LaborDemandPageQueryParams
} from '@/types/labor'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

// 用户信息和权限
const userStore = useUserStore()

// 格式化货币
const formatCurrency = (value: number) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
    .format(value)
    .replace(/\.00$/, '')
}

// 格式化状态
const formatStatus = (status: LaborDemandStatus | string) => {
  if (typeof status === 'string') {
    const statusMap: Record<string, string> = {
      'open': '开放中',
      'filled': '已满',
      'cancelled': '已取消',
      'expired': '已过期'
    }
    return statusMap[status] || '未知状态'
  } else {
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
}

// 获取状态对应的类型
const getStatusType = (status: LaborDemandStatus | string) => {
  if (typeof status === 'string') {
    const typeMap: Record<string, string> = {
      'open': 'success',
      'filled': 'info',
      'cancelled': 'danger',
      'expired': 'warning'
    }
    return typeMap[status] || ''
  } else {
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
}

// 标签页
const activeTab = ref('myProjects')

// 加载状态
const loading = ref(false)
const inProgressLoading = ref(false)
const submitting = reactive({
  draft: false,
  submit: false
})

// 表格数据
const tableData = ref<LaborDemandListItem[]>([])
const inProgressData = ref<LaborDemandListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  projectId: undefined as number | undefined,
  occupationId: undefined as number | undefined,
  status: undefined as string | undefined
})

// 切换标签页
const handleTabChange = (tab: any) => {
  if (tab.props.name === 'inProgress') {
    fetchInProgressData()
  } else {
    fetchData()
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
  
  // 重新加载数据
  currentPage.value = 1
  fetchData()
}

// 将新的状态字符串映射到旧的数字状态
const mapStatusToLegacy = (status: string): LaborDemandStatus => {
  switch (status) {
    case 'open':
      return LaborDemandStatus.InProgress // 4
    case 'filled':
      return LaborDemandStatus.Completed // 5
    case 'cancelled':
      return LaborDemandStatus.Canceled // 6
    case 'expired':
      return LaborDemandStatus.Canceled // 也映射到已取消
    default:
      return LaborDemandStatus.Draft // 默认为草稿
  }
}

// 将旧的数字状态映射到新的字符串状态
const mapLegacyToNewStatus = (status: LaborDemandStatus): string => {
  switch (status) {
    case LaborDemandStatus.Draft:
    case LaborDemandStatus.Pending:
    case LaborDemandStatus.Approved:
    case LaborDemandStatus.InProgress:
      return 'open'
    case LaborDemandStatus.Completed:
      return 'filled'
    case LaborDemandStatus.Rejected:
    case LaborDemandStatus.Canceled:
      return 'cancelled'
    default:
      return 'open'
  }
}

// 格式化日期字符串
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return ''
  // 检查是否是带T和时区的ISO格式
  if (dateStr.includes('T')) {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }
  return dateStr
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const router = useRouter()
    const managerId = userStore.userId
    
    if (!managerId) {
      ElMessage.error('无法获取用户信息，请重新登录')
      router.push('/login')
      return
    }
    
    // 获取项目经理管理的项目列表
    const projectRes = await getManagerProjectList(managerId)
    
    if (projectRes.code === 0 && projectRes.data) {
      const projectIds = projectRes.data.map(project => project.id)
      
      // 构建查询参数
      const queryParams: LaborDemandPageQueryParams = {
        page: currentPage.value,
        size: pageSize.value
      }
      
      // 添加筛选条件
      if (searchForm.projectId) {
        // 验证项目是否属于该经理管理
        if (projectIds.includes(searchForm.projectId)) {
          queryParams.projectId = searchForm.projectId
        } else {
          throw new Error('您没有权限查看该项目的劳务需求')
        }
      } else {
        // 如果没有指定项目，则获取该经理管理的所有项目的需求
        // 按照项目分批次获取并合并结果
        const allResults: LaborDemandListItemNew[] = []
        
        for (const projectId of projectIds) {
          try {
            const res = await getLaborDemandsByProject(projectId)
            if (res.code === 0 && res.data) {
              allResults.push(...res.data)
            }
          } catch (error) {
            console.error(`获取项目${projectId}劳务需求失败`, error)
          }
        }
        
        // 过滤和排序结果
        let filteredResults = allResults
        
        // 应用其他筛选条件
        if (searchForm.status) {
          filteredResults = filteredResults.filter(item => item.status === searchForm.status)
        }
        
        if (searchForm.occupationId) {
          filteredResults = filteredResults.filter(item => item.jobTypeId === searchForm.occupationId)
        }
        
        if (searchForm.keyword) {
          const keyword = searchForm.keyword.toLowerCase()
          filteredResults = filteredResults.filter(item => 
            item.projectName.toLowerCase().includes(keyword) || 
            item.jobTypeName.toLowerCase().includes(keyword) ||
            (item.requirements && item.requirements.toLowerCase().includes(keyword))
          )
        }
        
        // 按时间降序排序
        filteredResults.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        
        // 计算分页
        total.value = filteredResults.length
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        const paginatedResults = filteredResults.slice(start, end)
        
        // 格式化为旧格式的数据以便兼容
        tableData.value = paginatedResults.map(item => ({
          id: item.id,
          projectId: item.projectId,
          projectName: item.projectName,
          companyId: 0, // 不需要公司ID
          companyName: item.companyName || '',
          title: item.projectName, // 使用项目名称作为标题
          occupationId: item.jobTypeId,
          occupationName: item.jobTypeName,
          requiredCount: item.headcount,
          startDate: formatDateString(item.startDate),
          endDate: formatDateString(item.endDate),
          dailyWage: item.dailyWage,
          status: typeof item.status === 'string' ? item.status : mapLegacyToNewStatus(item.status as LaborDemandStatus),
          createTime: formatDateString(item.createTime)
        }))
        
        loading.value = false
        return
      }
      
      // 如果设置了项目ID，则直接查询该项目的需求
      if (queryParams.projectId) {
        if (searchForm.status) queryParams.status = searchForm.status
        if (searchForm.occupationId) queryParams.jobTypeId = searchForm.occupationId
        
        const res = await getLaborDemandPage(queryParams)
        
        if (res.code === 0 && res.data) {
          // 转换数据格式以适应现有UI
          tableData.value = res.data.records.map(item => ({
            id: item.id,
            projectId: item.projectId,
            projectName: item.projectName,
            companyId: 0, // 不需要公司ID
            companyName: item.companyName || '',
            title: item.projectName, // 使用项目名称作为标题
            occupationId: item.jobTypeId,
            occupationName: item.jobTypeName,
            requiredCount: item.headcount,
            startDate: formatDateString(item.startDate),
            endDate: formatDateString(item.endDate),
            dailyWage: item.dailyWage,
            status: typeof item.status === 'string' ? item.status : mapLegacyToNewStatus(item.status as LaborDemandStatus),
            createTime: formatDateString(item.createTime)
          }))
          total.value = res.data.total
        } else {
          throw new Error(res.message || '获取劳务需求列表失败')
        }
      }
    } else {
      throw new Error(projectRes.message || '获取项目列表失败')
    }
  } catch (error: any) {
    console.error('获取劳务需求列表失败', error)
    ElMessage.error(error.message || '获取劳务需求列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 获取进行中的需求
const fetchInProgressData = async () => {
  inProgressLoading.value = true
  try {
    const router = useRouter()
    const managerId = userStore.userId
    
    if (!managerId) {
      ElMessage.error('无法获取用户信息，请重新登录')
      router.push('/login')
      return
    }
    
    // 获取项目经理管理的项目列表
    const projectRes = await getManagerProjectList(managerId)
    
    if (projectRes.code === 0 && projectRes.data) {
      const projectIds = projectRes.data.map(project => project.id)
      
      // 按照项目分批次获取并合并结果
      const allResults: LaborDemandListItemNew[] = []
      
      for (const projectId of projectIds) {
        try {
          const res = await getLaborDemandsByProject(projectId)
          if (res.code === 0 && res.data) {
            allResults.push(...res.data)
          }
        } catch (error) {
          console.error(`获取项目${projectId}劳务需求失败`, error)
        }
      }
      
      // 仅保留状态为"进行中"的需求
      const inProgressDemands = allResults.filter(item => item.status === 'open')
      
      // 转换为内部数据格式
      inProgressData.value = inProgressDemands.map(item => ({
        id: item.id,
        title: item.title,
        projectId: item.projectId,
        projectName: item.projectName,
        occupationId: item.jobTypeId,
        occupationName: item.jobTypeName,
        occupationCategoryId: null,
        occupationCategoryName: null,
        requiredCount: item.count,
        dailyWage: item.salary,
        totalBudget: item.count * item.salary * calculateWorkDays(item.startDate, item.endDate),
        startDate: formatDateString(item.startDate),
        endDate: formatDateString(item.endDate),
        status: item.status,
        requirements: item.requirements,
        createTime: formatDateString(item.createTime)
      }))
    } else {
      throw new Error(projectRes.message || '获取项目列表失败')
    }
  } catch (error: any) {
    console.error('获取进行中的劳务需求失败', error)
    ElMessage.error(error.message || '获取进行中的劳务需求失败，请稍后再试')
  } finally {
    inProgressLoading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  if (activeTab.value === 'inProgress') {
    fetchInProgressData()
  } else {
    fetchData()
  }
}

// 选项数据
const projectOptions = ref<{ id: number; name: string }[]>([])
const occupationOptions = ref<{ id: number; name: string }[]>([])

// 获取项目经理管理的项目列表
const fetchProjectList = async () => {
  try {
    const res = await getManagerProjectList(userStore.userId)
    
    if (res.code === 0 && res.data) {
      projectOptions.value = res.data.map(item => ({
        id: item.id,
        name: item.name
      }))
    } else {
      throw new Error(res.message || '获取项目列表失败')
    }
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
const form = reactive({
  projectId: undefined as number | undefined,
  title: '',
  jobTypeId: undefined as number | undefined,
  headcount: 1,
  dailyWage: 300,
  startDate: '',
  endDate: '',
  workHours: '8:00-18:00',
  requirements: '',
  accommodation: false,
  meals: false
})

// 表单验证规则
const rules = {
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  jobTypeId: [
    { required: true, message: '请选择工种', trigger: 'change' }
  ],
  headcount: [
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
  workHours: [
    { required: true, message: '请输入工作时间', trigger: 'blur' }
  ]
}

// 添加需求
const handleAdd = () => {
  isEdit.value = false
  form.projectId = undefined
  form.title = ''
  form.jobTypeId = undefined
  form.headcount = 1
  form.dailyWage = 300
  form.startDate = ''
  form.endDate = ''
  form.workHours = '8:00-18:00'
  form.requirements = ''
  form.accommodation = false
  form.meals = false
  
  dialogVisible.value = true
}

// 编辑需求
const handleEdit = async (row: LaborDemandListItem | LaborDemand) => {
  isEdit.value = true
  
  try {
    // 如果传入的是列表项，需要先获取详情
    if (!('requirements' in row)) {
      const res = await getLaborDemandById(row.id)
      if (res.code === 0 && res.data) {
        setFormData(res.data)
      } else {
        throw new Error(res.message || '获取劳务需求详情失败')
      }
    } else {
      // 直接使用传入的详情数据
      setFormData(row as any)
    }
    
    dialogVisible.value = true
    drawerVisible.value = false
  } catch (error: any) {
    console.error('获取劳务需求详情失败', error)
    ElMessage.error(error.message || '获取劳务需求详情失败，请稍后再试')
  }
}

// 设置表单数据
const setFormData = (demand: any) => {
  form.projectId = demand.projectId
  form.title = demand.title || ''
  form.jobTypeId = demand.jobTypeId || demand.occupationId
  form.headcount = demand.headcount || demand.requiredCount
  form.dailyWage = demand.dailyWage
  form.startDate = formatDateString(demand.startDate)
  form.endDate = formatDateString(demand.endDate)
  form.workHours = demand.workHours || '8:00-18:00'
  form.requirements = demand.requirements || ''
  form.accommodation = demand.accommodation === undefined ? false : demand.accommodation
  form.meals = demand.meals === undefined ? false : demand.meals
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        submitting.submit = true
        
        if (isEdit.value && currentDemand.value?.id) {
          // 更新需求
          const updateParams = {
            id: currentDemand.value.id,
            title: form.title,
            headcount: form.headcount,
            dailyWage: form.dailyWage,
            startDate: form.startDate,
            endDate: form.endDate,
            workHours: form.workHours,
            requirements: form.requirements,
            accommodation: form.accommodation,
            meals: form.meals
          }
          
          // 调用新API更新劳务需求
          const res = await updateLaborDemand(updateParams)
          
          if (res.code !== 0) {
            throw new Error(res.message || '更新劳务需求失败')
          }
          
          ElMessage.success('已更新劳务需求')
        } else {
          // 添加需求
          if (!form.projectId || !form.jobTypeId) {
            throw new Error('请选择项目和工种')
          }
          
          const addParams = {
            title: form.title,
            projectId: form.projectId,
            jobTypeId: form.jobTypeId,
            headcount: form.headcount,
            dailyWage: form.dailyWage,
            startDate: form.startDate,
            endDate: form.endDate,
            workHours: form.workHours,
            requirements: form.requirements,
            accommodation: form.accommodation,
            meals: form.meals
          }
          
          // 调用新API创建劳务需求
          const res = await createLaborDemand(addParams)
          
          if (res.code !== 0) {
            throw new Error(res.message || '创建劳务需求失败')
          }
          
          ElMessage.success('已创建劳务需求')
        }
        
        dialogVisible.value = false
        refreshData()
      } catch (error: any) {
        ElMessage.error(error.message || '提交失败，请稍后再试')
      } finally {
        submitting.submit = false
      }
    }
  })
}

// 提交劳务需求
const handleSubmit = async (row: LaborDemandListItem) => {
  try {
    // 更新状态
    const res = await changeLaborDemandStatus({
      id: row.id,
      status: 'open' // 更新为开放状态
    })
    
    if (res.code === 0) {
      ElMessage.success('劳务需求已成功发布')
      // 刷新数据
      fetchData()
    } else {
      throw new Error(res.message || '发布失败')
    }
  } catch (error: any) {
    console.error('发布劳务需求失败', error)
    ElMessage.error(error.message || '发布劳务需求失败，请稍后再试')
  }
}

// 标记完成
const handleComplete = async (row: LaborDemandListItem | LaborDemand) => {
  ElMessageBox.confirm(
    '确定要将此劳务需求标记为已完成吗？',
    '完成确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      // 使用新API更新状态为filled
      await changeLaborDemandStatus({ 
        id: row.id, 
        status: 'filled' 
      })
      ElMessage.success('已标记为完成')
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
      refreshData()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败，请稍后再试')
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
      // 使用新API删除需求
      await removeLaborDemand(row.id)
      ElMessage.success('删除成功')
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
      refreshData()
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

// 获取当前用户ID
const getUserId = () => {
  return userStore.userId
}

// 获取用户角色
const isProjectManagerRole = () => {
  // 优先使用store中的角色信息，如果不存在则使用localStorage的用户类型
  return userStore.isProjectManager || localStorage.getItem('userType') === 'manager'
}

// 初始化
onMounted(async () => {
  const router = useRouter()
  
  // 检查是否是项目经理角色
  if (!isProjectManagerRole()) {
    ElMessage.error('只有项目经理才能访问此页面')
    router.push('/dashboard')
    return
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