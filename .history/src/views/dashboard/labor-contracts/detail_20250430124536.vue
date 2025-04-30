<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit, Check } from '@element-plus/icons-vue'
import { getLaborContractDetail, updateLaborContractStatus, approveLaborContract } from '@/api/laborContract'
import type { LaborContractDetail } from '@/types/laborContract'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const contractId = ref<number>(Number(route.params.id))

// 合同详情状态
const loading = ref(false)
const contractDetail = ref<LaborContractDetail | null>(null)

// 状态更新对话框状态
const statusDialogVisible = ref(false)
const statusForm = ref({
  status: 'terminated' as 'active' | 'terminated' | 'expired',
  terminationReason: ''
})

// 审核对话框状态
const approveDialogVisible = ref(false)
const approveForm = ref({
  approved: true,
  remarks: ''
})
const approveFormRules = {
  remarks: [
    { required: true, message: '请输入审核意见', trigger: 'blur' },
    { min: 2, max: 200, message: '审核意见长度应在 2 到 200 个字符之间', trigger: 'blur' }
  ]
}
const approveFormRef = ref()

// 获取合同详情
const fetchContractDetail = async () => {
  loading.value = true
  try {
    const response = await getLaborContractDetail(contractId.value)
    if (response.code === 0) {
      contractDetail.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取合同详情失败')
    console.error('获取合同详情失败', error)
  } finally {
    loading.value = false
  }
}

// 返回列表页面
const goBack = () => {
  router.push('/dashboard/labor-contracts')
}

// 打开更新状态对话框
const handleUpdateStatus = () => {
  // 只有待签署和活动状态的合同可以更新
  if (contractDetail.value?.status !== 'active' && contractDetail.value?.status !== 'unsign') {
    ElMessage.warning('只有待签署或生效中的合同可以更新状态')
    return
  }
  
  // 根据当前状态设置默认值
  if (contractDetail.value?.status === 'unsign') {
    statusForm.value.status = 'active'
    statusForm.value.terminationReason = ''
  } else if (contractDetail.value?.status === 'active') {
    statusForm.value.status = 'terminated'
  }
  
  statusDialogVisible.value = true
}

// 提交状态更新
const submitStatusUpdate = async () => {
  if (!statusFormRef.value) return
  
  await statusFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      let data: { status: string; terminationReason?: string } = {
        status: statusForm.value.status
      }
      
      // 如果选择终止，需要终止原因
      if (statusForm.value.status === 'terminated') {
        data.terminationReason = statusForm.value.terminationReason
      }
      
      const response = await updateLaborContractStatus(contractId.value, data)
      if (response.code === 0) {
        ElMessage.success('合同状态更新成功')
        statusDialogVisible.value = false
        fetchContractDetail() // 重新获取合同详情
      }
    } catch (error) {
      ElMessage.error('合同状态更新失败')
    }
  })
}

// 打开审核对话框
const handleApprove = () => {
  // 只有待审核状态的合同可以进行审核
  if (contractDetail.value?.status !== 'review') {
    ElMessage.warning('只有待审核状态的合同可以进行审核')
    return
  }
  
  approveForm.value.approved = true
  approveForm.value.remarks = ''
  approveDialogVisible.value = true
}

// 提交合同审核
const submitApprove = async () => {
  if (!approveFormRef.value) return
  
  await approveFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      const response = await approveLaborContract(contractId.value, {
        approved: approveForm.value.approved,
        remarks: approveForm.value.remarks
      })
      
      if (response.code === 0) {
        ElMessage.success(approveForm.value.approved ? '合同审核通过' : '合同审核已拒绝')
        approveDialogVisible.value = false
        fetchContractDetail() // 重新获取合同详情
      }
    } catch (error) {
      ElMessage.error('合同审核失败')
    }
  })
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info'
    case 'unsign':
      return 'warning'
    case 'review':
      return 'primary'
    case 'active':
      return 'success'
    case 'terminated':
      return 'danger'
    case 'expired':
      return 'info'
    default:
      return 'info'
  }
}

// 获取状态显示文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待发起签署'
    case 'unsign':
      return '待签署'
    case 'review':
      return '待审核'
    case 'active':
      return '生效中'
    case 'terminated':
      return '已终止'
    case 'expired':
      return '已过期'
    default:
      return '未知'
  }
}

// 初始化
onMounted(() => {
  fetchContractDetail()
})
</script>

<template>
  <div class="labor-contract-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack" :icon="ArrowLeft" text>返回列表</el-button>
            <h3 class="header-title">劳务合同详情</h3>
          </div>
          <div class="header-right">
            <el-button 
              type="primary" 
              @click="handleUpdateStatus"
              :icon="Edit"
              :disabled="contractDetail?.status !== 'active' && contractDetail?.status !== 'pending'"
            >
              更新状态
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="contractDetail">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="合同编号">{{ contractDetail.contractCode }}</el-descriptions-item>
          <el-descriptions-item label="合同模板">{{ contractDetail.templateName }}</el-descriptions-item>
          <el-descriptions-item label="劳工姓名">{{ contractDetail.jobSeekerName }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ contractDetail.projectName }}</el-descriptions-item>
          <el-descriptions-item label="起始日期">{{ contractDetail.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ contractDetail.endDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(contractDetail.status)">
              {{ getStatusText(contractDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="续签次数">{{ contractDetail.renewalCount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ contractDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ contractDetail.updateTime }}</el-descriptions-item>
          <el-descriptions-item 
            v-if="contractDetail.terminationReason" 
            label="终止原因" 
            :span="2"
          >
            {{ contractDetail.terminationReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div v-else class="empty-data">
        <el-empty description="未找到合同详情" />
      </div>
    </el-card>
    
    <!-- 更新状态对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新合同状态"
      width="50%"
    >
      <el-form 
        ref="statusFormRef"
        :model="statusForm" 
        :rules="statusFormRules"
        label-width="100px"
      >
        <el-form-item label="合同状态" prop="status">
          <el-radio-group v-model="statusForm.status">
            <el-radio v-if="contractDetail?.status === 'pending'" label="active">激活合同</el-radio>
            <el-radio v-if="contractDetail?.status === 'active'" label="terminated">终止合同</el-radio>
            <el-radio v-if="contractDetail?.status === 'active'" label="expired">合同过期</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          v-if="statusForm.status === 'terminated'" 
          label="终止原因" 
          prop="terminationReason"
        >
          <el-input 
            v-model="statusForm.terminationReason" 
            type="textarea" 
            :rows="4"
            placeholder="请输入终止合同的原因" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatusUpdate">确认</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审核合同"
      width="50%"
    >
      <el-form 
        ref="approveFormRef"
        :model="approveForm" 
        :rules="approveFormRules"
        label-width="100px"
      >
        <el-form-item label="审核结果" prop="approved">
          <el-radio-group v-model="approveForm.approved">
            <el-radio label="true">通过</el-radio>
            <el-radio label="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="审核意见" prop="remarks">
          <el-input 
            v-model="approveForm.remarks" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审核意见" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.labor-contract-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  margin: 0 0 0 10px;
}

.empty-data {
  padding: 40px 0;
}
</style>