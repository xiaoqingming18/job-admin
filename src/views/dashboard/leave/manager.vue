<template>
  <div class="leave-manager-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>请假管理（项目经理）</h2>
      <div class="actions">
        <el-button type="primary" @click="goToApprovalLogs">查看审批记录</el-button>
      </div>
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
              v-if="scope.row.status === 'pending'"
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

    <!-- 新建请假申请对话框 -->
    <el-dialog
      v-model="addLeaveDialogVisible"
      title="新建请假申请"
      width="550px"
    >
      <el-form 
        :model="addLeaveForm" 
        :rules="addLeaveRules" 
        ref="addLeaveFormRef" 
        label-width="100px"
      >
        <el-form-item label="项目" prop="projectId">
          <el-select v-model="addLeaveForm.projectId" placeholder="选择项目" filterable>
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="addLeaveForm.leaveType" placeholder="选择请假类型">
            <el-option
              v-for="(value, key) in leaveTypeOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="请假日期" prop="dateRange">
          <el-date-picker
            v-model="addLeaveForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="calculateTotalDays"
          />
        </el-form-item>
        
        <el-form-item label="请假天数" prop="totalDays">
          <el-input-number 
            v-model="addLeaveForm.totalDays" 
            :min="0.5" 
            :step="0.5" 
            :precision="1" 
            controls-position="right"
          />
        </el-form-item>
        
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="addLeaveForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入请假原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addLeaveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddLeave" :loading="addLeaveSubmitting">
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
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getManagerProjectList } from '@/api/project'
import { getProjectMemberList } from '@/api/projectMember'
import { getProjectLeaves, approveLeaveByManager, applyLeave, getPendingApprovalLeaves } from '@/api/leave'
import type { LeaveQueryParams, Leave, LeaveApprovalRequest, LeaveApplyRequest } from '@/types/leave'
import { leaveTypeOptions, leaveStatusOptions } from '@/types/leave'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const activeTab = ref('all')
const leaveList = ref<Leave[]>([])
const total = ref(0)
const projects = ref<{ id: number; name: string }[]>([])
const projectMembers = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const approvalDialogVisible = ref(false)
const currentLeave = ref<Leave | null>(null)
const approvalSubmitting = ref(false)

// 添加请假相关
const addLeaveDialogVisible = ref(false)
const addLeaveSubmitting = ref(false)
const addLeaveFormRef = ref<FormInstance>()

// 查询参数
const queryParams = reactive<LeaveQueryParams>({
  page: 1,
  size: 10,
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

// 添加请假表单
const addLeaveForm = reactive({
  projectId: undefined as number | undefined,
  leaveType: '',
  dateRange: [] as string[],
  totalDays: 1,
  reason: ''
})

// 添加请假表单验证规则
const addLeaveRules = reactive<FormRules>({
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  leaveType: [
    { required: true, message: '请选择请假类型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择请假日期', trigger: 'change' }
  ],
  totalDays: [
    { required: true, message: '请输入请假天数', trigger: 'blur' },
    { type: 'number', min: 0.5, message: '请假天数最少0.5天', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入请假原因', trigger: 'blur' },
    { min: 2, max: 200, message: '请假原因长度应在2-200个字符之间', trigger: 'blur' }
  ]
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
    queryParams.status = 'pending'
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

// 计算请假天数
const calculateTotalDays = () => {
  if (addLeaveForm.dateRange && addLeaveForm.dateRange.length === 2) {
    const startDate = new Date(addLeaveForm.dateRange[0])
    const endDate = new Date(addLeaveForm.dateRange[1])
    
    // 计算两个日期之间的天数
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // 包含起止日期
    
    addLeaveForm.totalDays = diffDays
  }
}

// 加载项目列表
const loadProjects = async () => {
  try {
    // 获取当前用户
    const userId = userStore.userId
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }
    
    const res = await getManagerProjectList(userId)
    projects.value = res.data || []
  } catch (error) {
    console.error('加载项目列表失败', error)
    ElMessage.error('加载项目列表失败')
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
  queryParams.projectId = undefined
  queryParams.memberId = undefined
  queryParams.leaveType = undefined
  queryParams.status = activeTab.value === 'pending' ? 'pending' : undefined
  queryParams.startDate = undefined
  queryParams.endDate = undefined
  dateRange.value = null
  queryParams.page = 1
  
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
    
    if (activeTab.value === 'pending') {
      // 获取待审批的请假
      const res = await getPendingApprovalLeaves(params)
      leaveList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      // 获取项目请假列表
      if (queryParams.projectId) {
        const res = await getProjectLeaves(queryParams.projectId, params)
        leaveList.value = res.data.records || []
        total.value = res.data.total || 0
      } else {
        leaveList.value = []
        total.value = 0
        ElMessage.info('请选择一个项目进行查询')
      }
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
    await approveLeaveByManager(approvalForm)
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

// 打开添加请假对话框
const handleAddLeave = () => {
  addLeaveForm.projectId = queryParams.projectId
  addLeaveForm.leaveType = ''
  addLeaveForm.dateRange = []
  addLeaveForm.totalDays = 1
  addLeaveForm.reason = ''
  
  addLeaveDialogVisible.value = true
}

// 提交添加请假申请
const submitAddLeave = async () => {
  if (!addLeaveFormRef.value) return
  
  await addLeaveFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!addLeaveForm.dateRange || addLeaveForm.dateRange.length !== 2) {
        ElMessage.warning('请选择请假日期')
        return
      }
      
      addLeaveSubmitting.value = true
      try {
        const leaveRequest: LeaveApplyRequest = {
          projectId: addLeaveForm.projectId!,
          leaveType: addLeaveForm.leaveType,
          startDate: addLeaveForm.dateRange[0],
          endDate: addLeaveForm.dateRange[1],
          totalDays: addLeaveForm.totalDays,
          reason: addLeaveForm.reason
        }
        
        await applyLeave(leaveRequest)
        ElMessage.success('请假申请提交成功')
        addLeaveDialogVisible.value = false
        fetchLeaveList()
      } catch (error) {
        console.error('提交请假申请失败', error)
        ElMessage.error('提交请假申请失败')
      } finally {
        addLeaveSubmitting.value = false
      }
    }
  })
}

// 跳转到审批记录页面
const goToApprovalLogs = () => {
  router.push('/dashboard/leave/approval-logs')
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.leave-manager-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.action-bar {
  margin-bottom: 16px;
}
</style> 