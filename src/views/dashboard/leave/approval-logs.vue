<template>
  <div class="approval-logs-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>请假审批记录</h2>
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
        
        <el-form-item label="申请人">
          <el-select v-model="queryParams.userId" placeholder="选择申请人" clearable filterable>
            <el-option
              v-for="item in projectMembers"
              :key="item.userId"
              :label="item.realName || item.username"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="审批人">
          <el-select v-model="queryParams.approverId" placeholder="选择审批人" clearable filterable>
            <el-option
              v-for="item in approvers"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="审批结果">
          <el-select v-model="queryParams.action" placeholder="审批结果" clearable>
            <el-option
              v-for="(value, key) in approvalActionOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
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
    
    <!-- 审批记录表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>审批记录列表</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="logsList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="leaveId" label="请假ID" width="80" />
        <el-table-column prop="approverName" label="审批人" width="100" />
        <el-table-column prop="approverRoleDesc" label="审批人角色" width="120" />
        <el-table-column label="审批结果" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.action === 'approve' ? 'success' : 'danger'">
              {{ scope.row.actionDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actionTime" label="审批时间" width="150" />
        <el-table-column prop="comments" label="审批意见" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="viewLeaveDetail(scope.row.leaveId)"
            >
              查看请假详情
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getLeaveApprovalLogs, getAllLeaveApprovalLogs } from '@/api/leave'
import { getManagerProjectList } from '@/api/project'
import { getProjectMemberList } from '@/api/projectMember'
import type { LeaveApprovalLog } from '@/types/leave'
import { approvalActionOptions } from '@/types/leave'

const router = useRouter()
const userStore = useUserStore()

// 数据列表
const logsList = ref<LeaveApprovalLog[]>([])
const projects = ref<any[]>([])
const projectMembers = ref<any[]>([])
const approvers = ref<any[]>([])

// 查询条件
const queryParams = reactive({
  page: 1,
  size: 10,
  projectId: undefined as number | undefined,
  userId: undefined as number | undefined,
  approverId: undefined as number | undefined,
  action: undefined as string | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 加载状态与总数
const loading = ref(false)
const total = ref(0)

// 当项目选择发生变化时加载项目成员
const handleProjectChange = async (projectId: number) => {
  if (!projectId) {
    projectMembers.value = []
    return
  }
  
  try {
    const res = await getProjectMemberList(projectId)
    if (res.code === 0 && res.data) {
      projectMembers.value = res.data || []
    }
  } catch (error) {
    console.error('加载项目成员失败', error)
    ElMessage.error('加载项目成员失败')
  }
}

// 搜索审批记录
const handleSearch = () => {
  if (dateRange.value) {
    [queryParams.startDate, queryParams.endDate] = dateRange.value
  } else {
    queryParams.startDate = undefined
    queryParams.endDate = undefined
  }
  
  // 添加审批动作筛选
  if (queryParams.action === '') {
    queryParams.action = undefined
  }
  
  queryParams.page = 1
  loadApprovalLogs()
}

// 重置查询条件
const resetQuery = () => {
  Object.keys(queryParams).forEach(key => {
    if (key !== 'page' && key !== 'size') {
      queryParams[key] = undefined
    }
  })
  dateRange.value = null
  queryParams.page = 1
  loadApprovalLogs()
}

// 加载审批记录
const loadApprovalLogs = async () => {
  loading.value = true
  try {
    const res = await getAllLeaveApprovalLogs(queryParams)
    logsList.value = res.data.records || []
    total.value = res.data.total
  } catch (error) {
    console.error('加载审批记录失败', error)
    ElMessage.error('加载审批记录失败')
  } finally {
    loading.value = false
  }
}

// 加载项目列表
const loadProjects = async () => {
  try {
    const userId = userStore.userId || 0;
    const res = await getManagerProjectList(userId);
    if (res.code === 0 && res.data) {
      projects.value = res.data || []
    }
  } catch (error) {
    console.error('加载项目列表失败', error)
    ElMessage.error('加载项目列表失败')
  }
}

// 加载审批人列表（模拟数据）
const loadApprovers = async () => {
  approvers.value = [
    { id: 1, name: '张经理' },
    { id: 2, name: '李经理' },
    { id: 3, name: '王管理员' },
    { id: 4, name: '赵管理员' }
  ]
}

// 查看请假详情
const viewLeaveDetail = (leaveId: number) => {
  router.push(`/dashboard/leave/detail/${leaveId}`)
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  loadApprovalLogs()
}

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  loadApprovalLogs()
}

onMounted(() => {
  loadProjects()
  loadApprovers()
  loadApprovalLogs()
})
</script>

<style scoped>
.approval-logs-container {
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
</style> 