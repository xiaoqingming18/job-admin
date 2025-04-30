<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Edit, Delete, Plus, Search, Refresh, Check } from '@element-plus/icons-vue'
import { getLaborContracts, generateLaborContract, approveLaborContract } from '@/api/laborContract'
import { getContractTemplates, getContractTemplateDetail } from '@/api/contractTemplate'
import { getProjectList } from '@/api/project'
import type { LaborContract } from '@/types/laborContract'
import type { ContractTemplate } from '@/types/contractTemplate'
import type { Project } from '@/types/project'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 合同列表状态
const loading = ref(false)
const contractList = ref<LaborContract[]>([])
const statusFilter = ref<'pending' | 'unsign' | 'review' | 'active' | 'terminated' | 'expired' | ''>('')
const projectIdFilter = ref<number | ''>('')

// 分页状态
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 项目列表(用于筛选)
const projectList = ref<Project[]>([])
const loadingProjects = ref(false)

// 生成合同对话框状态
const generateDialogVisible = ref(false)
const generateForm = reactive({
  templateId: undefined as number | undefined,
  projectId: undefined as number | undefined,
  jobSeekerId: undefined as number | undefined,
  startDate: '',
  endDate: '',
  variables: {} as Record<string, string>
})
const generateFormRules = {
  templateId: [{ required: true, message: '请选择合同模板', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  jobSeekerId: [{ required: true, message: '请选择求职者', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}
const generateFormRef = ref()

// 合同模板列表
const templateList = ref<ContractTemplate[]>([])
const loadingTemplates = ref(false)

// 当前选择的模板变量列表
const currentTemplateVariables = ref<Array<{ name: string; description: string }>>([])

// 审核对话框状态
const approveDialogVisible = ref(false)
const currentContract = ref<LaborContract | null>(null)
const approveForm = reactive({
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

// 获取合同列表
const fetchContractList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (projectIdFilter.value) {
      params.projectId = projectIdFilter.value
    }
    
    const response = await getLaborContracts(params)
    if (response.code === 0) {
      contractList.value = response.data
      pagination.total = response.data.length
    }
  } catch (error) {
    console.error('获取合同列表失败', error)
  } finally {
    loading.value = false
  }
}

// 获取项目列表
const fetchProjects = async () => {
  loadingProjects.value = true
  try {
    const response = await getProjectList({ pageNum: 1, pageSize: 100 })
    if (response.code === 0) {
      projectList.value = response.data.list
    }
  } catch (error) {
    console.error('获取项目列表失败', error)
  } finally {
    loadingProjects.value = false
  }
}

// 获取合同模板列表
const fetchTemplates = async () => {
  loadingTemplates.value = true
  try {
    const response = await getContractTemplates({ status: 'active' })
    if (response.code === 0) {
      templateList.value = response.data
    }
  } catch (error) {
    console.error('获取合同模板列表失败', error)
  } finally {
    loadingTemplates.value = false
  }
}

// 获取合同模板详情并更新变量
const fetchTemplateDetail = async (templateId: number) => {
  try {
    const response = await getContractTemplateDetail(templateId)
    if (response.code === 0) {
      currentTemplateVariables.value = response.data.variables
      
      // 重置 variables 对象
      generateForm.variables = {}
      
      // 为每个模板变量设置空值
      currentTemplateVariables.value.forEach(variable => {
        generateForm.variables[variable.name] = ''
      })
    }
  } catch (error) {
    console.error('获取模板详情失败', error)
  }
}

// 监听模板选择变化
const handleTemplateChange = (templateId: number) => {
  if (templateId) {
    fetchTemplateDetail(templateId)
  } else {
    currentTemplateVariables.value = []
    generateForm.variables = {}
  }
}

// 查看合同详情
const handleViewDetail = (id: number) => {
  router.push(`/dashboard/labor-contracts/${id}`)
}

// 打开生成合同对话框
const handleGenerate = () => {
  resetGenerateForm()
  generateDialogVisible.value = true
  // 加载模板和项目列表
  fetchTemplates()
  fetchProjects()
}

// 生成合同
const submitGenerateForm = async () => {
  if (!generateFormRef.value) return
  
  await generateFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    // 验证所有模板变量都已填写
    const missingVariables = []
    for (const variable of currentTemplateVariables.value) {
      if (!generateForm.variables[variable.name] || generateForm.variables[variable.name].trim() === '') {
        missingVariables.push(variable.name)
      }
    }
    
    if (missingVariables.length > 0) {
      ElMessage.error(`请填写以下变量: ${missingVariables.join(', ')}`)
      return
    }
    
    try {
      const response = await generateLaborContract({
        templateId: generateForm.templateId!,
        projectId: generateForm.projectId!,
        jobSeekerId: generateForm.jobSeekerId!,
        startDate: generateForm.startDate,
        endDate: generateForm.endDate,
        variables: generateForm.variables
      })
      
      if (response.code === 0) {
        ElMessage.success('合同生成成功')
        generateDialogVisible.value = false
        fetchContractList()
      }
    } catch (error) {
      ElMessage.error('合同生成失败')
    }
  })
}

// 重置生成合同表单
const resetGenerateForm = () => {
  Object.assign(generateForm, {
    templateId: undefined,
    projectId: undefined,
    jobSeekerId: undefined,
    startDate: '',
    endDate: '',
    variables: {}
  })
  
  // 清空当前模板变量
  currentTemplateVariables.value = []
  
  if (generateFormRef.value) {
    generateFormRef.value.resetFields()
  }
}

// 根据状态获取标签类型
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
  fetchContractList()
  fetchProjects()
})

// 打开审核对话框
const handleOpenApproveDialog = (contract: LaborContract) => {
  if (contract.status !== 'review') {
    ElMessage.warning('只有待审核状态的合同可以进行审核')
    return
  }
  
  currentContract.value = contract
  approveForm.approved = true
  approveForm.remarks = ''
  approveDialogVisible.value = true
}

// 提交合同审核
const submitApprove = async () => {
  if (!approveFormRef.value || !currentContract.value) return
  
  await approveFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      const response = await approveLaborContract(currentContract.value.id, {
        approved: approveForm.approved,
        remarks: approveForm.remarks
      })
      
      if (response.code === 0) {
        ElMessage.success(approveForm.approved ? '合同审核通过' : '合同审核已拒绝')
        approveDialogVisible.value = false
        fetchContractList() // 刷新列表
      }
    } catch (error) {
      ElMessage.error('合同审核失败')
    }
  })
}
</script>

<template>
  <div class="labor-contracts-container">
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h3>劳务合同管理</h3>
          <div class="header-actions">
            <el-select 
              v-model="statusFilter" 
              placeholder="合同状态" 
              clearable 
              @change="fetchContractList"
            >
              <el-option label="待发起签署" value="pending" />
              <el-option label="待签署" value="unsign" />
              <el-option label="待审核" value="review" />
              <el-option label="生效中" value="active" />
              <el-option label="已终止" value="terminated" />
              <el-option label="已过期" value="expired" />
            </el-select>
            
            <el-select 
              v-model="projectIdFilter" 
              placeholder="选择项目" 
              clearable 
              @change="fetchContractList"
            >
              <el-option 
                v-for="project in projectList" 
                :key="project.id" 
                :label="project.name" 
                :value="project.id" 
              />
            </el-select>
            
            <el-button type="primary" @click="fetchContractList" :icon="Refresh">刷新</el-button>
            <el-button type="success" @click="handleGenerate" :icon="Plus">生成合同</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="contractList" 
        border 
        stripe 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column label="合同编号" prop="contractCode" min-width="150" />
        <el-table-column label="劳工姓名" prop="jobSeekerName" min-width="120" />
        <el-table-column label="项目名称" prop="projectName" min-width="200" />
        <el-table-column label="起始日期" prop="startDate" min-width="120" />
        <el-table-column label="结束日期" prop="endDate" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewDetail(row.id)"
              :icon="Document"
              circle
              title="查看详情"
            />
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          @update:current-page="pagination.currentPage = $event"
          @update:page-size="pagination.pageSize = $event"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>
    
    <!-- 生成合同对话框 -->
    <el-dialog
      v-model="generateDialogVisible"
      title="生成劳务合同"
      width="60%"
      @close="resetGenerateForm"
    >
      <el-form 
        ref="generateFormRef"
        :model="generateForm" 
        :rules="generateFormRules"
        label-width="100px"
      >
        <el-form-item label="合同模板" prop="templateId">
          <el-select 
            v-model="generateForm.templateId" 
            placeholder="请选择合同模板"
            style="width: 100%"
            :loading="loadingTemplates"
            @change="handleTemplateChange"
          >
            <el-option 
              v-for="template in templateList" 
              :key="template.id" 
              :label="template.name" 
              :value="template.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="项目" prop="projectId">
          <el-select 
            v-model="generateForm.projectId" 
            placeholder="请选择项目"
            style="width: 100%"
            :loading="loadingProjects"
          >
            <el-option 
              v-for="project in projectList" 
              :key="project.id" 
              :label="project.name" 
              :value="project.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="求职者ID" prop="jobSeekerId">
          <el-input v-model.number="generateForm.jobSeekerId" placeholder="请输入求职者ID" />
        </el-form-item>
        
        <el-form-item label="合同日期" required>
          <el-col :span="11">
            <el-form-item prop="startDate">
              <el-date-picker
                v-model="generateForm.startDate"
                type="date"
                placeholder="开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">至</el-col>
          <el-col :span="11">
            <el-form-item prop="endDate">
              <el-date-picker
                v-model="generateForm.endDate"
                type="date"
                placeholder="结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-form-item>
        
        <el-form-item label="自定义变量">
          <div v-if="currentTemplateVariables.length === 0" class="no-variables">
            请先选择合同模板
          </div>
          <template v-else>
            <div v-for="variable in currentTemplateVariables" :key="variable.name" class="variable-item">
              <el-input
                v-model="generateForm.variables[variable.name]"
                :placeholder="variable.description"
                class="mb-2"
              >
                <template #prepend>{{ variable.name }}</template>
              </el-input>
            </div>
            <div class="form-tip">
              注意: 请填写所有模板变量，这些变量将用于生成合同内容
            </div>
          </template>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGenerateForm">确认生成</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审核劳务合同"
      width="30%"
      @close="handleCloseApproveDialog"
    >
      <el-form 
        ref="approveFormRef"
        :model="approveForm" 
        :rules="approveFormRules"
        label-width="100px"
      >
        <el-form-item label="审核意见" prop="remarks">
          <el-input type="textarea" v-model="approveForm.remarks" placeholder="请输入审核意见" />
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
.labor-contracts-container {
  padding: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.mb-2 {
  margin-bottom: 10px;
}

.no-variables {
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}

.variable-item {
  margin-bottom: 10px;
}
</style>