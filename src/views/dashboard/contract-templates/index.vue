<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Document, Edit, Delete, Plus, Search, Refresh } from '@element-plus/icons-vue'
import { 
  getContractTemplates, 
  getContractTemplateDetail, 
  createContractTemplate, 
  updateContractTemplate, 
  deleteContractTemplate 
} from '@/api/contractTemplate'
import type { 
  ContractTemplate, 
  ContractTemplateDetail, 
  ContractTemplateVariable 
} from '@/types/contractTemplate'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模板列表状态
const loading = ref(false)
const templateList = ref<ContractTemplate[]>([])
const statusFilter = ref<'active' | 'inactive' | ''>('')

// 分页状态
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单对话框状态
const templateDialogVisible = ref(false)
const templateDialogType = ref<'create' | 'edit'>('create')
const templateForm = reactive({
  id: 0,
  name: '',
  content: '',
  variables: [] as ContractTemplateVariable[],
  status: 'active' as 'active' | 'inactive'
})
const templateFormRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
}
const templateFormRef = ref()

// 详情对话框状态
const detailDialogVisible = ref(false)
const templateDetail = ref<ContractTemplateDetail | null>(null)

// 获取模板列表
const fetchTemplateList = async () => {
  loading.value = true
  try {
    const params = statusFilter.value ? { status: statusFilter.value } : {}
    const response = await getContractTemplates(params)
    if (response.code === 0) {
      templateList.value = response.data
      pagination.total = response.data.length
    }
  } catch (error) {
    console.error('获取模板列表失败', error)
  } finally {
    loading.value = false
  }
}

// 查看模板详情
const handleViewDetail = async (id: number) => {
  try {
    const response = await getContractTemplateDetail(id)
    if (response.code === 0) {
      templateDetail.value = response.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取模板详情失败')
  }
}

// 打开创建模板对话框
const handleCreate = () => {
  templateDialogType.value = 'create'
  resetTemplateForm()
  // 初始化一个空变量，方便添加
  templateForm.variables = [{ name: '', description: '' }]
  templateDialogVisible.value = true
}

// 打开编辑模板对话框
const handleEdit = async (id: number) => {
  try {
    const response = await getContractTemplateDetail(id)
    if (response.code === 0) {
      templateDialogType.value = 'edit'
      const detail = response.data
      Object.assign(templateForm, {
        id: detail.id,
        name: detail.name,
        content: detail.content,
        variables: [...detail.variables],
        status: detail.status
      })
      templateDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取模板详情失败')
  }
}

// 删除模板
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除该模板吗？删除后无法恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const response = await deleteContractTemplate(id)
        if (response.code === 0) {
          ElMessage.success('删除成功')
          fetchTemplateList()
        }
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 提交表单
const submitForm = async () => {
  if (!templateFormRef.value) return
  
  await templateFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      // 过滤掉空的变量
      const filteredVariables = templateForm.variables.filter(v => v.name.trim() !== '')
      
      if (templateDialogType.value === 'create') {
        // 创建模板
        const response = await createContractTemplate({
          name: templateForm.name,
          content: templateForm.content,
          variables: filteredVariables
        })
        
        if (response.code === 0) {
          ElMessage.success('创建成功')
          templateDialogVisible.value = false
          fetchTemplateList()
        }
      } else {
        // 编辑模板
        const response = await updateContractTemplate(templateForm.id, {
          name: templateForm.name,
          content: templateForm.content,
          variables: filteredVariables,
          status: templateForm.status
        })
        
        if (response.code === 0) {
          ElMessage.success('更新成功')
          templateDialogVisible.value = false
          fetchTemplateList()
        }
      }
    } catch (error) {
      ElMessage.error(templateDialogType.value === 'create' ? '创建失败' : '更新失败')
    }
  })
}

// 重置表单
const resetTemplateForm = () => {
  Object.assign(templateForm, {
    id: 0,
    name: '',
    content: '',
    variables: [],
    status: 'active'
  })
  if (templateFormRef.value) {
    templateFormRef.value.resetFields()
  }
}

// 添加变量
const addVariable = () => {
  templateForm.variables.push({ name: '', description: '' })
}

// 删除变量
const removeVariable = (index: number) => {
  templateForm.variables.splice(index, 1)
}

// 根据状态获取标签类型
const getStatusTagType = (status: string) => {
  return status === 'active' ? 'success' : 'info'
}

// 初始化
onMounted(() => {
  fetchTemplateList()
})
</script>

<template>
  <div class="contract-templates-container">
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h3>合同模板管理</h3>
          <div class="header-actions">
            <el-select 
              v-model="statusFilter" 
              placeholder="状态筛选" 
              clearable 
              @change="fetchTemplateList"
            >
              <el-option label="启用" value="active" />
              <el-option label="停用" value="inactive" />
            </el-select>
            <el-button type="primary" @click="fetchTemplateList" :icon="Refresh">刷新</el-button>
            <el-button type="success" @click="handleCreate" :icon="Plus">新建模板</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="templateList" 
        border 
        stripe 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="模板名称" prop="name" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewDetail(row.id)"
              :icon="Document"
              circle
              title="查看详情"
            />
            <el-button 
              type="warning" 
              size="small" 
              @click="handleEdit(row.id)"
              :icon="Edit"
              circle
              title="编辑"
            />
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(row.id)"
              :icon="Delete"
              circle
              title="删除"
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
    
    <!-- 模板详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="合同模板详情"
      width="70%"
    >
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="模板ID">{{ templateDetail?.id }}</el-descriptions-item>
        <el-descriptions-item label="模板名称">{{ templateDetail?.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(templateDetail?.status || '')">
            {{ templateDetail?.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ templateDetail?.createTime }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="detail-section">
        <h4>模板内容：</h4>
        <el-input 
          type="textarea" 
          :rows="8" 
          :model-value="templateDetail?.content || ''" 
          readonly 
        />
      </div>
      
      <div class="detail-section">
        <h4>模板变量：</h4>
        <el-table :data="templateDetail?.variables || []" border stripe>
          <el-table-column label="变量名" prop="name" />
          <el-table-column label="描述" prop="description" />
        </el-table>
      </div>
    </el-dialog>
    
    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="templateDialogType === 'create' ? '创建合同模板' : '编辑合同模板'"
      width="70%"
      @close="resetTemplateForm"
    >
      <el-form 
        ref="templateFormRef"
        :model="templateForm" 
        :rules="templateFormRules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        
        <el-form-item label="模板内容" prop="content">
          <el-input 
            type="textarea" 
            v-model="templateForm.content" 
            :rows="10"
            placeholder="请输入模板内容，变量使用 ${变量名} 格式" 
          />
          <div class="form-tip">
            提示: 变量使用 ${变量名} 格式，例如 ${company_name}
          </div>
        </el-form-item>
        
        <el-form-item v-if="templateDialogType === 'edit'" label="状态">
          <el-radio-group v-model="templateForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="模板变量">
          <div v-for="(variable, index) in templateForm.variables" :key="index" class="variable-item">
            <el-input 
              v-model="variable.name" 
              placeholder="变量名" 
              class="variable-name-input"
            />
            <el-input 
              v-model="variable.description" 
              placeholder="变量描述" 
              class="variable-desc-input" 
            />
            <el-button 
              type="danger" 
              circle 
              @click="removeVariable(index)"
              :icon="Delete"
              :disabled="templateForm.variables.length <= 1"
            />
          </div>
          <div class="variable-actions">
            <el-button type="primary" @click="addVariable" :icon="Plus">添加变量</el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.contract-templates-container {
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

.detail-section {
  margin-top: 20px;
}

.variable-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.variable-name-input {
  width: 200px;
}

.variable-desc-input {
  flex: 1;
}

.variable-actions {
  margin-top: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 