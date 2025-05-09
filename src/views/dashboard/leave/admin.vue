<template>
  <div class="leave-admin-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>请假管理（系统管理员）</h2>
      <div class="tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="所有请假记录" name="all"></el-tab-pane>
          <el-tab-pane label="待审批" name="pending"></el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 查询条件卡片 -->
    <el-card class="search-card">      
      <!-- 查询条件 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="企业">
          <el-select v-model="queryParams.companyId" placeholder="选择企业" clearable filterable @change="handleCompanyChange">
            <el-option
              v-for="item in companies"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="项目">
          <el-select v-model="queryParams.projectId" placeholder="选择项目" clearable filterable @change="handleProjectChange">
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="成员">
          <el-select v-model="queryParams.memberId" placeholder="选择成员" clearable filterable>
            <el-option
              v-for="item in projectMembers"
              :key="item.memberId"
              :label="item.realName || item.username"
              :value="item.memberId"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="请假类型">
          <el-select v-model="queryParams.leaveType" placeholder="请假类型" clearable>
            <el-option
              v-for="(value, key) in leaveTypeOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请假状态" clearable>
            <el-option
              v-for="(value, key) in leaveStatusOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 请假记录表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>请假记录</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="leaveList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userName" label="申请人" width="100" />
        <el-table-column prop="projectName" label="所属项目" width="120" show-overflow-tooltip />
        <el-table-column prop="companyName" label="所属企业" width="120" show-overflow-tooltip />
        <el-table-column label="请假类型" width="100">
          <template #default="scope">
            {{ scope.row.leaveTypeDesc }}
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="100" />
        <el-table-column prop="endDate" label="结束日期" width="100" />
        <el-table-column prop="totalDays" label="天数" width="80" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicationTime" label="申请时间" width="150" />
        <el-table-column prop="reason" label="请假原因" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="handleViewDetail(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="scope.row.status === 'first_approved'"
              size="small" 
              link 
              type="success" 
              @click="handleApprove(scope.row)"
            >
              审批
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      title="请假审批"
      width="500px"
    >
      <div v-if="currentLeave" class="approval-dialog-content">
        <div class="leave-info">
          <p><strong>申请人：</strong>{{ currentLeave.userName }}</p>
          <p><strong>请假类型：</strong>{{ currentLeave.leaveTypeDesc }}</p>
          <p><strong>请假日期：</strong>{{ currentLeave.startDate }} 至 {{ currentLeave.endDate }}</p>
          <p><strong>请假天数：</strong>{{ currentLeave.totalDays }} 天</p>
          <p><strong>请假原因：</strong>{{ currentLeave.reason }}</p>
        </div>
        
        <el-form :model="approvalForm" label-width="80px">
          <el-form-item label="审批操作">
            <el-radio-group v-model="approvalForm.action">
              <el-radio label="approve">批准</el-radio>
              <el-radio label="reject">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="审批意见">
            <el-input
              v-model="approvalForm.comments"
              type="textarea"
              :rows="3"
              placeholder="请输入审批意见"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval" :loading="approvalSubmitting">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCompanyList } from '@/api/company'
import { getCompanyProjectList } from '@/api/project'
import { getProjectMemberList } from '@/api/projectMember'
import { getCompanyLeaves, approveLeaveByAdmin } from '@/api/leave'
import type { LeaveQueryParams, Leave, LeaveApprovalRequest } from '@/types/leave'
import { leaveTypeOptions, leaveStatusOptions } from '@/types/leave'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('all')
const leaveList = ref<Leave[]>([])
const total = ref(0)
const companies = ref<{ id: number; name: string }[]>([])
const projects = ref<{ id: number; name: string }[]>([])
const projectMembers = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const approvalDialogVisible = ref(false)
const currentLeave = ref<Leave | null>(null)
const approvalSubmitting = ref(false)

// 查询参数
const queryParams = reactive<LeaveQueryParams>({
  page: 1,
  size: 10,
  companyId: undefined,
  projectId: undefined,
  memberId: undefined,
  leaveType: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined
})

// 审批表单
const approvalForm = reactive<LeaveApprovalRequest>({
  leaveId: 0,
  action: 'approve',
  comments: ''
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: (() => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    })()
  },
  {
    text: '最近一个月',
    value: (() => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    })()
  },
  {
    text: '最近三个月',
    value: (() => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    })()
  }
]

// 监听选项卡变化
watch(activeTab, (newVal) => {
  if (newVal === 'pending') {
    queryParams.status = 'first_approved'
  } else {
    queryParams.status = undefined
  }
  fetchLeaveList()
})

// 获取状态样式
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info'
    case 'first_approved':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'cancelled':
      return ''
    default:
      return ''
  }
}

// 加载企业列表
const loadCompanies = async () => {
  try {
    const res = await getCompanyList({})
    companies.value = res.data.records || []
  } catch (error) {
    console.error('加载企业列表失败', error)
    ElMessage.error('加载企业列表失败')
  }
}

// 企业变更处理
const handleCompanyChange = async (companyId: number) => {
  queryParams.projectId = undefined
  queryParams.memberId = undefined
  projects.value = []
  projectMembers.value = []
  
  if (companyId) {
    try {
      const res = await getCompanyProjectList(companyId)
      projects.value = res.data || []
    } catch (error) {
      console.error('加载项目列表失败', error)
      ElMessage.error('加载项目列表失败')
    }
  }
}

// 项目变更处理
const handleProjectChange = async (projectId: number) => {
  queryParams.memberId = undefined
  projectMembers.value = []
  
  if (projectId) {
    try {
      const res = await getProjectMemberList(projectId)
      projectMembers.value = res.data || []
    } catch (error) {
      console.error('加载项目成员失败', error)
      ElMessage.error('加载项目成员失败')
    }
  }
}

// 搜索处理
const handleSearch = () => {
  if (dateRange.value) {
    queryParams.startDate = dateRange.value[0]
    queryParams.endDate = dateRange.value[1]
  } else {
    queryParams.startDate = undefined
    queryParams.endDate = undefined
  }
  
  queryParams.page = 1
  fetchLeaveList()
}

// 重置查询
const resetQuery = () => {
  queryParams.companyId = undefined
  queryParams.projectId = undefined
  queryParams.memberId = undefined
  queryParams.leaveType = undefined
  queryParams.status = activeTab.value === 'pending' ? 'first_approved' : undefined
  queryParams.startDate = undefined
  queryParams.endDate = undefined
  dateRange.value = null
  queryParams.page = 1
  
  projects.value = []
  projectMembers.value = []
  
  fetchLeaveList()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.size = val
  fetchLeaveList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.page = val
  fetchLeaveList()
}

// 获取请假列表
const fetchLeaveList = async () => {
  loading.value = true
  try {
    let params = { ...queryParams }
    
    if (queryParams.companyId) {
      const res = await getCompanyLeaves(queryParams.companyId, params)
      leaveList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      // 系统管理员看所有企业的请假记录
      // 这里应该有一个获取全部请假记录的API，暂时保留空表
      leaveList.value = []
      total.value = 0
      ElMessage.info('请选择一个企业进行查询')
    }
  } catch (error) {
    console.error('获取请假列表失败', error)
    ElMessage.error('获取请假列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleViewDetail = (row: Leave) => {
  router.push(`/dashboard/leave/${row.id}`)
}

// 处理审批操作
const handleApprove = (row: Leave) => {
  currentLeave.value = row
  approvalForm.leaveId = row.id
  approvalForm.action = 'approve'
  approvalForm.comments = ''
  approvalDialogVisible.value = true
}

// 提交审批
const submitApproval = async () => {
  if (!approvalForm.leaveId) {
    ElMessage.warning('请假记录ID不能为空')
    return
  }
  
  approvalSubmitting.value = true
  try {
    await approveLeaveByAdmin(approvalForm)
    ElMessage.success('审批成功')
    approvalDialogVisible.value = false
    fetchLeaveList()
  } catch (error) {
    console.error('审批失败', error)
    ElMessage.error('审批失败')
  } finally {
    approvalSubmitting.value = false
  }
}

onMounted(() => {
  loadCompanies()
})
</script>

<style scoped>
.leave-admin-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.search-card,
.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.leave-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.leave-info p {
  margin: 8px 0;
}
</style> 