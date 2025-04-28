<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, Document, Edit, Calendar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLaborContracts, submitContractSigning, submitContractRenewal } from '@/api/laborContract'
import type { LaborContract, ContractRenewalRequest } from '@/types/laborContract'

const router = useRouter()
const loading = ref(false)
const contractList = ref<LaborContract[]>([])
const statusFilter = ref<'pending' | 'active' | 'expired' | ''>('')

// 分页状态
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 合同续约对话框状态
const renewalDialogVisible = ref(false)
const selectedContract = ref<LaborContract | null>(null)
const renewalForm = reactive<ContractRenewalRequest>({
  newStartDate: '',
  newEndDate: '',
  remarks: ''
})
const renewalFormRules = {
  newStartDate: [{ required: true, message: '请选择新的开始日期', trigger: 'change' }],
  newEndDate: [{ required: true, message: '请选择新的结束日期', trigger: 'change' }],
  remarks: [
    { required: true, message: '请输入续约原因', trigger: 'blur' },
    { min: 5, max: 200, message: '续约原因长度应在 5 到 200 个字符之间', trigger: 'blur' }
  ]
}
const renewalFormRef = ref()

// 获取合同列表
const fetchContractList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    const response = await getLaborContracts(params)
    if (response.code === 0) {
      contractList.value = response.data.filter(contract => 
        contract.status === 'pending' || contract.status === 'active' || contract.status === 'expired'
      )
      pagination.total = contractList.value.length
    }
  } catch (error) {
    console.error('获取合同列表失败', error)
    ElMessage.error('获取合同列表失败')
  } finally {
    loading.value = false
  }
}

// 处理提交合同签订
const handleSubmitSigning = async (contract: LaborContract) => {
  if (contract.status !== 'pending') {
    ElMessage.warning('只有待签状态的合同可以提交签订')
    return
  }

  try {
    ElMessageBox.confirm(
      `确定要提交合同 ${contract.contractCode} 进行签订吗？`,
      '提交确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        const response = await submitContractSigning(contract.id)
        if (response.code === 0) {
          ElMessage.success('合同签订提交成功')
          fetchContractList() // 刷新列表
        }
      })
      .catch(() => {
        // 用户取消操作
      })
  } catch (error) {
    console.error('提交合同签订失败', error)
    ElMessage.error('提交合同签订失败')
  }
}

// 打开合同续约对话框
const handleOpenRenewal = (contract: LaborContract) => {
  if (contract.status !== 'active' && contract.status !== 'expired') {
    ElMessage.warning('只有生效中或已过期的合同可以申请续约')
    return
  }

  selectedContract.value = contract
  
  // 设置默认续约日期（从当前合同结束日期后一天开始）
  const endDate = new Date(contract.endDate)
  const newStartDate = new Date(endDate)
  newStartDate.setDate(newStartDate.getDate() + 1)
  
  // 设置默认的结束日期（开始日期后6个月）
  const newEndDate = new Date(newStartDate)
  newEndDate.setMonth(newEndDate.getMonth() + 6)
  
  // 格式化日期为YYYY-MM-DD
  renewalForm.newStartDate = newStartDate.toISOString().split('T')[0]
  renewalForm.newEndDate = newEndDate.toISOString().split('T')[0]
  renewalForm.remarks = ''
  
  renewalDialogVisible.value = true
}

// 提交合同续约申请
const submitRenewal = async () => {
  if (!renewalFormRef.value || !selectedContract.value) return
  
  await renewalFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      const newStartDate = new Date(renewalForm.newStartDate)
      const newEndDate = new Date(renewalForm.newEndDate)
      const today = new Date()
      
      // 验证日期
      if (newStartDate < today) {
        ElMessage.error('新的开始日期必须大于或等于今天')
        return
      }
      
      if (newEndDate <= newStartDate) {
        ElMessage.error('新的结束日期必须大于开始日期')
        return
      }
      
      const response = await submitContractRenewal(selectedContract.value.id, {
        newStartDate: renewalForm.newStartDate,
        newEndDate: renewalForm.newEndDate,
        remarks: renewalForm.remarks
      })
      
      if (response.code === 0) {
        ElMessage.success('合同续约申请提交成功')
        renewalDialogVisible.value = false
        fetchContractList() // 刷新列表
      }
    } catch (error) {
      console.error('提交合同续约失败', error)
      ElMessage.error('提交合同续约失败')
    }
  })
}

// 刷新列表
const handleRefresh = () => {
  fetchContractList()
}

// 根据状态获取标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info'
    case 'active':
      return 'success'
    case 'terminated':
      return 'danger'
    case 'expired':
      return 'warning'
    case 'review':
      return 'primary'
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
    case 'review':
      return '审核中'
    default:
      return '未知'
  }
}

// 页面初始化
onMounted(() => {
  fetchContractList()
})
</script>

<template>
  <div class="contract-signing-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h3>合同签约与续签管理</h3>
          <div class="header-actions">
            <el-button @click="handleRefresh" :icon="Refresh" circle />
          </div>
        </div>
      </template>
      
      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-form :inline="true">
          <el-form-item label="合同状态">
            <el-select v-model="statusFilter" placeholder="选择合同状态" clearable @change="fetchContractList">
              <el-option label="待签" value="pending" />
              <el-option label="生效中" value="active" />
              <el-option label="已过期" value="expired" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="fetchContractList">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 合同列表 -->
      <el-table :data="contractList" stripe border style="width: 100%">
        <el-table-column prop="contractCode" label="合同编号" min-width="120" />
        <el-table-column prop="jobSeekerName" label="劳工姓名" min-width="100" />
        <el-table-column prop="projectName" label="项目名称" min-width="150" />
        <el-table-column prop="startDate" label="开始日期" min-width="120" />
        <el-table-column prop="endDate" label="结束日期" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <!-- 待签合同显示提交签订按钮 -->
            <el-button 
              v-if="row.status === 'pending'" 
              type="primary" 
              size="small" 
              :icon="Document"
              @click="handleSubmitSigning(row)"
            >
              提交签订
            </el-button>
            
            <!-- 生效中或已过期的合同显示申请续约按钮 -->
            <el-button 
              v-if="row.status === 'active' || row.status === 'expired'" 
              type="success" 
              size="small" 
              :icon="Calendar"
              @click="handleOpenRenewal(row)"
            >
              申请续约
            </el-button>
            
            <!-- 查看合同详情 -->
            <el-button 
              type="info" 
              size="small" 
              :icon="Document"
              @click="router.push(`/dashboard/labor-contracts/${row.id}`)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </el-card>
    
    <!-- 合同续约对话框 -->
    <el-dialog
      v-model="renewalDialogVisible"
      title="申请合同续约"
      width="50%"
    >
      <el-form 
        ref="renewalFormRef"
        :model="renewalForm" 
        :rules="renewalFormRules"
        label-width="120px"
      >
        <el-form-item label="合同编号">
          <el-input :value="selectedContract ? selectedContract.contractCode : ''" disabled />
        </el-form-item>
        <el-form-item label="劳工姓名">
          <el-input :value="selectedContract ? selectedContract.jobSeekerName : ''" disabled />
        </el-form-item>
        <el-form-item label="原开始日期">
          <el-input :value="selectedContract ? selectedContract.startDate : ''" disabled />
        </el-form-item>
        <el-form-item label="原结束日期">
          <el-input :value="selectedContract ? selectedContract.endDate : ''" disabled />
        </el-form-item>
        <el-form-item label="新开始日期" prop="newStartDate">
          <el-date-picker 
            v-model="renewalForm.newStartDate" 
            type="date" 
            placeholder="选择新的开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="新结束日期" prop="newEndDate">
          <el-date-picker 
            v-model="renewalForm.newEndDate" 
            type="date" 
            placeholder="选择新的结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="续约原因" prop="remarks">
          <el-input 
            v-model="renewalForm.remarks" 
            type="textarea" 
            :rows="4"
            placeholder="请输入续约原因" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="renewalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRenewal">提交续约申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.contract-signing-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
