<template>
  <div class="leave-detail-container">
    <div class="page-header">
      <div class="back-button">
        <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
      </div>
      <h2>请假详情</h2>
      <div class="actions">
        <el-button type="primary" @click="goToApprovalLogs">所有审批记录</el-button>
      </div>
    </div>

    <el-card v-if="loading" class="loading-card">
      <el-skeleton style="width: 100%" animated :rows="10" />
    </el-card>

    <template v-else-if="leaveDetail">
      <!-- 请假信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(leaveDetail.status)">{{ leaveDetail.statusDesc }}</el-tag>
          </div>
        </template>
        
        <div class="info-content">
          <div class="info-group">
            <div class="info-item">
              <div class="label">请假单号：</div>
              <div class="value">{{ leaveDetail.id }}</div>
            </div>
            <div class="info-item">
              <div class="label">申请人：</div>
              <div class="value">{{ leaveDetail.userName }}</div>
            </div>
            <div class="info-item">
              <div class="label">所属项目：</div>
              <div class="value">{{ leaveDetail.projectName }}</div>
            </div>
            <div class="info-item">
              <div class="label">所属企业：</div>
              <div class="value">{{ leaveDetail.companyName }}</div>
            </div>
          </div>
          
          <div class="info-group">
            <div class="info-item">
              <div class="label">请假类型：</div>
              <div class="value">{{ leaveDetail.leaveTypeDesc }}</div>
            </div>
            <div class="info-item">
              <div class="label">开始日期：</div>
              <div class="value">{{ leaveDetail.startDate }}</div>
            </div>
            <div class="info-item">
              <div class="label">结束日期：</div>
              <div class="value">{{ leaveDetail.endDate }}</div>
            </div>
            <div class="info-item">
              <div class="label">请假天数：</div>
              <div class="value">{{ leaveDetail.totalDays }} 天</div>
            </div>
          </div>
          
          <div class="info-group full-width">
            <div class="info-item">
              <div class="label">请假原因：</div>
              <div class="value">{{ leaveDetail.reason }}</div>
            </div>
            <div class="info-item">
              <div class="label">申请时间：</div>
              <div class="value">{{ leaveDetail.applicationTime }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 审批信息卡片 -->
      <el-card class="approval-card">
        <template #header>
          <div class="card-header">
            <span>审批信息</span>
          </div>
        </template>
        
        <div class="approval-content">
          <div class="approval-item">
            <div class="approver">
              <div class="title">项目经理审批</div>
              <div class="name">{{ leaveDetail.pmApproverName || '暂无' }}</div>
              <div class="time">{{ leaveDetail.pmApprovalTime || '-' }}</div>
            </div>
            <div class="approval-status">
              <el-tag :type="getApprovalStatusType(leaveDetail.pmApprovalStatus)">
                {{ leaveDetail.pmApprovalStatusDesc || '待审批' }}
              </el-tag>
            </div>
            <div class="comments">
              <div class="label">审批意见：</div>
              <div class="content">{{ leaveDetail.pmApprovalComments || '暂无' }}</div>
            </div>
          </div>
          
          <div class="approval-divider"></div>
          
          <div class="approval-item">
            <div class="approver">
              <div class="title">企业管理员审批</div>
              <div class="name">{{ leaveDetail.adminApproverName || '暂无' }}</div>
              <div class="time">{{ leaveDetail.adminApprovalTime || '-' }}</div>
            </div>
            <div class="approval-status">
              <el-tag :type="getApprovalStatusType(leaveDetail.adminApprovalStatus)">
                {{ leaveDetail.adminApprovalStatusDesc || '待审批' }}
              </el-tag>
            </div>
            <div class="comments">
              <div class="label">审批意见：</div>
              <div class="content">{{ leaveDetail.adminApprovalComments || '暂无' }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 审批日志卡片 -->
      <el-card class="logs-card">
        <template #header>
          <div class="card-header">
            <span>审批日志</span>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in approvalLogs"
            :key="index"
            :timestamp="log.actionTime"
            :type="log.action === 'approve' ? 'success' : log.action === 'reject' ? 'danger' : 'info'"
          >
            <div class="log-content">
              <div class="log-title">
                {{ log.approverName }} ({{ log.approverRoleDesc }}) {{ log.actionDesc }}了请假申请
              </div>
              <div v-if="log.comments" class="log-comments">
                审批意见: {{ log.comments }}
              </div>
            </div>
          </el-timeline-item>
          
          <el-timeline-item
            timestamp="系统记录"
            type="primary"
          >
            <div class="log-content">
              <div class="log-title">
                {{ leaveDetail.userName }} 提交了请假申请
              </div>
              <div class="log-comments">
                申请时间: {{ leaveDetail.applicationTime }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 操作区域 -->
      <div v-if="showActionButtons" class="action-area">
        <el-button v-if="canCancel" type="danger" @click="handleCancel">取消申请</el-button>
        <el-button v-if="canApproveByManager" type="primary" @click="handleApproveByManager">项目经理审批</el-button>
        <el-button v-if="canApproveByAdmin" type="primary" @click="handleApproveByAdmin">企业管理员审批</el-button>
      </div>
    </template>

    <el-empty v-else description="请假记录不存在或已被删除" />

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      :title="approvalDialogTitle"
      width="500px"
    >
      <div class="approval-dialog-content">
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

    <!-- 取消申请确认框 -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消请假申请"
      width="400px"
    >
      <div class="cancel-dialog-content">
        <p>确定要取消此请假申请吗？</p>
        <p class="warning">此操作不可撤销!</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="submitCancel" :loading="cancelSubmitting">
            确认取消申请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getLeaveDetail, getLeaveApprovalLogs, approveLeaveByManager, approveLeaveByAdmin, cancelLeave } from '@/api/leave'
import type { LeaveDetail, LeaveApprovalLog, LeaveApprovalRequest, LeaveCancelRequest } from '@/types/leave'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const leaveDetail = ref<LeaveDetail | null>(null)
const approvalLogs = ref<LeaveApprovalLog[]>([])

// 审批相关
const approvalDialogVisible = ref(false)
const approvalDialogTitle = ref('请假审批')
const approvalSubmitting = ref(false)
const approvalForm = ref<LeaveApprovalRequest>({
  leaveId: 0,
  action: 'approve',
  comments: ''
})
const approvalType = ref<'manager' | 'admin'>('manager')

// 取消申请相关
const cancelDialogVisible = ref(false)
const cancelSubmitting = ref(false)

// 计算属性
const leaveId = computed(() => Number(route.params.id))
const canCancel = computed(() => {
  if (!leaveDetail.value) return false
  
  const userId = userStore.user?.id
  const status = leaveDetail.value.status
  
  return (
    userId === leaveDetail.value.userId && 
    (status === 'pending' || status === 'first_approved')
  )
})

const canApproveByManager = computed(() => {
  if (!leaveDetail.value) return false
  
  const isManager = userStore.isProjectManager
  const status = leaveDetail.value.status
  const pmApprovalStatus = leaveDetail.value.pmApprovalStatus
  
  return isManager && status === 'pending' && (!pmApprovalStatus || pmApprovalStatus === 'pending')
})

const canApproveByAdmin = computed(() => {
  if (!leaveDetail.value) return false
  
  const isAdmin = userStore.isAdmin || userStore.isCompanyAdmin
  const status = leaveDetail.value.status
  const adminApprovalStatus = leaveDetail.value.adminApprovalStatus
  
  return isAdmin && status === 'first_approved' && (!adminApprovalStatus || adminApprovalStatus === 'pending')
})

const showActionButtons = computed(() => {
  return canCancel.value || canApproveByManager.value || canApproveByAdmin.value
})

// 加载请假详情
const loadLeaveDetail = async () => {
  loading.value = true
  try {
    const res = await getLeaveDetail(leaveId.value)
    leaveDetail.value = res.data
    
    // 加载审批日志
    const logsRes = await getLeaveApprovalLogs(leaveId.value)
    approvalLogs.value = logsRes.data
  } catch (error) {
    console.error('加载请假详情失败', error)
    ElMessage.error('加载请假详情失败')
  } finally {
    loading.value = false
  }
}

// 获取状态样式
const getStatusType = (status: string | undefined) => {
  if (!status) return ''
  
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

// 获取审批状态样式
const getApprovalStatusType = (status: string | undefined) => {
  if (!status) return 'info'
  
  switch (status) {
    case 'pending':
      return 'info'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return ''
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 项目经理审批
const handleApproveByManager = () => {
  if (!leaveDetail.value) return
  
  approvalType.value = 'manager'
  approvalDialogTitle.value = '项目经理审批'
  approvalForm.value = {
    leaveId: leaveDetail.value.id,
    action: 'approve',
    comments: ''
  }
  approvalDialogVisible.value = true
}

// 企业管理员审批
const handleApproveByAdmin = () => {
  if (!leaveDetail.value) return
  
  approvalType.value = 'admin'
  approvalDialogTitle.value = '企业管理员审批'
  approvalForm.value = {
    leaveId: leaveDetail.value.id,
    action: 'approve',
    comments: ''
  }
  approvalDialogVisible.value = true
}

// 提交审批
const submitApproval = async () => {
  approvalSubmitting.value = true
  try {
    if (approvalType.value === 'manager') {
      await approveLeaveByManager(approvalForm.value)
    } else {
      await approveLeaveByAdmin(approvalForm.value)
    }
    
    ElMessage.success('审批成功')
    approvalDialogVisible.value = false
    
    // 刷新详情数据
    await loadLeaveDetail()
  } catch (error) {
    console.error('提交审批失败', error)
    ElMessage.error('提交审批失败')
  } finally {
    approvalSubmitting.value = false
  }
}

// 打开取消申请对话框
const handleCancel = () => {
  cancelDialogVisible.value = true
}

// 提交取消申请
const submitCancel = async () => {
  if (!leaveDetail.value) return
  
  cancelSubmitting.value = true
  try {
    const cancelRequest: LeaveCancelRequest = {
      leaveId: leaveDetail.value.id
    }
    
    await cancelLeave(cancelRequest)
    ElMessage.success('请假申请已取消')
    cancelDialogVisible.value = false
    
    // 刷新详情数据
    await loadLeaveDetail()
  } catch (error) {
    console.error('取消申请失败', error)
    ElMessage.error('取消申请失败')
  } finally {
    cancelSubmitting.value = false
  }
}

// 跳转到审批记录页面
const goToApprovalLogs = () => {
  router.push('/dashboard/leave/approval-logs')
}

onMounted(() => {
  loadLeaveDetail()
})
</script>

<style scoped>
.leave-detail-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 20px;
}

.actions {
  margin-left: auto;
}

.info-card,
.approval-card,
.logs-card,
.loading-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-content,
.approval-content {
  padding: 10px;
}

.info-group {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.info-group.full-width {
  flex-direction: column;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  width: 50%;
}

.info-group.full-width .info-item {
  width: 100%;
}

.info-item .label {
  font-weight: bold;
  width: 100px;
  flex-shrink: 0;
}

.info-item .value {
  flex-grow: 1;
}

.approval-item {
  margin-bottom: 15px;
}

.approval-divider {
  height: 1px;
  background-color: #eee;
  margin: 20px 0;
}

.approver {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.approver .title {
  font-weight: bold;
  margin-right: 10px;
}

.approver .name {
  margin-right: 10px;
}

.approver .time {
  color: #999;
}

.approval-status {
  margin-bottom: 10px;
}

.comments {
  display: flex;
}

.comments .label {
  font-weight: bold;
  width: 80px;
  flex-shrink: 0;
}

.comments .content {
  flex-grow: 1;
}

.log-content {
  margin-bottom: 10px;
}

.log-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.log-comments {
  color: #666;
}

.action-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.cancel-dialog-content {
  text-align: center;
}

.cancel-dialog-content .warning {
  color: #f56c6c;
  font-weight: bold;
}
</style> 