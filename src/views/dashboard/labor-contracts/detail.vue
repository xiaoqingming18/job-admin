<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { getLaborContractDetail, updateLaborContractStatus } from '@/api/laborContract'
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
const statusFormRules = {
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  terminationReason: [
    { required: true, message: '请输入终止原因', trigger: 'blur' },
    { min: 5, max: 200, message: '终止原因长度应在 5 到 200 个字符之间', trigger: 'blur' }
  ]
}
const statusFormRef = ref()

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
  // 待签和活动状态的合同可以更新
  if (contractDetail.value?.status !== 'active' && contractDetail.value?.status !== 'pending') {
    ElMessage.warning('只有待签或生效中的合同可以更新状态')
    return
  }
  
  // 根据当前状态设置默认值
  if (contractDetail.value?.status === 'pending') {
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

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info'
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
      return '待签'
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