<template>
  <div class="certificate-types-container">
    <div class="header">
      <el-button type="primary" @click="handleAdd">添加证书类型</el-button>
      
      <div class="search-box">
        <el-input
          v-model="queryParams.name"
          placeholder="证书名称"
          clearable
          @keyup.enter="handleSearch"
          style="width: 200px; margin-right: 15px;"
        />
        
        <el-select
          v-model="queryParams.category"
          placeholder="证书类别"
          clearable
          style="width: 200px; margin-right: 15px;"
        >
          <el-option label="建筑类" value="建筑类" />
          <el-option label="安全类" value="安全类" />
          <el-option label="职业技能类" value="职业技能类" />
          <el-option label="工程类" value="工程类" />
          <el-option label="特种作业类" value="特种作业类" />
          <el-option label="其他" value="其他" />
        </el-select>
        
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 150px; margin-right: 15px;"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="certificateTypeList"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="证书名称" min-width="150" />
      <el-table-column prop="category" label="证书类别" width="120" />
      <el-table-column prop="issuingAuthority" label="发证机构" min-width="150" />
      <el-table-column prop="validityYears" label="有效期(年)" width="100" align="center" />
      <el-table-column label="图标" width="100" align="center">
        <template #default="scope">
          <el-image
            v-if="scope.row.icon"
            :src="scope.row.icon"
            style="width: 40px; height: 40px"
            :preview-src-list="[scope.row.icon]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="primary"
            link
            size="small"
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button
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

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 证书类型表单对话框 -->
    <el-dialog
      :title="formTitle"
      v-model="dialogVisible"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="证书名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入证书名称" />
        </el-form-item>
        
        <el-form-item label="证书类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择证书类别" style="width: 100%">
            <el-option label="建筑类" value="建筑类" />
            <el-option label="安全类" value="安全类" />
            <el-option label="职业技能类" value="职业技能类" />
            <el-option label="工程类" value="工程类" />
            <el-option label="特种作业类" value="特种作业类" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="发证机构" prop="issuingAuthority">
          <el-input v-model="form.issuingAuthority" placeholder="请输入发证机构" />
        </el-form-item>
        
        <el-form-item label="有效期(年)" prop="validityYears">
          <el-input-number v-model="form.validityYears" :min="0" :max="100" />
        </el-form-item>
        
        <el-form-item label="证书图标">
          <el-upload
            class="icon-uploader"
            :action="''"
            :http-request="uploadIcon"
            :show-file-list="false"
            :on-success="handleIconSuccess"
            :before-upload="beforeIconUpload"
          >
            <img v-if="form.icon" :src="form.icon" class="icon-preview" />
            <el-icon v-else class="icon-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="icon-tip">建议上传正方形图标，大小不超过 2MB</div>
        </el-form-item>
        
        <el-form-item label="证书描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入证书描述"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getCertificateTypes, 
  getCertificateTypeDetail, 
  addCertificateType, 
  updateCertificateType, 
  deleteCertificateType, 
  uploadCertificateIcon 
} from '@/api/certificate'

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(/\//g, '-')
}

// 数据列表
const certificateTypeList = ref([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  name: '',
  category: '',
  status: ''
})

// 获取证书类型列表
const getCertificateTypeList = async () => {
  loading.value = true
  try {
    const { data } = await getCertificateTypes(queryParams)
    certificateTypeList.value = data.records
    total.value = data.total
  } catch (error) {
    console.error('获取证书类型列表失败', error)
    ElMessage.error('获取证书类型列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  queryParams.page = 1
  getCertificateTypeList()
}

// 重置查询
const resetQuery = () => {
  queryParams.name = ''
  queryParams.category = ''
  queryParams.status = ''
  handleSearch()
}

// 页码变更处理
const handleSizeChange = (size) => {
  queryParams.size = size
  getCertificateTypeList()
}

const handleCurrentChange = (page) => {
  queryParams.page = page
  getCertificateTypeList()
}

// 表单数据
const dialogVisible = ref(false)
const formRef = ref(null)
const formMode = ref('add')
const formTitle = computed(() => formMode.value === 'add' ? '添加证书类型' : '编辑证书类型')

const form = reactive({
  id: undefined,
  name: '',
  category: '',
  description: '',
  icon: '',
  issuingAuthority: '',
  validityYears: 0,
  status: 1
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入证书名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择证书类别', trigger: 'change' }],
  issuingAuthority: [{ required: true, message: '请输入发证机构', trigger: 'blur' }],
  validityYears: [{ required: true, message: '请输入有效期', trigger: 'blur' }]
}

// 添加证书类型
const handleAdd = () => {
  formMode.value = 'add'
  dialogVisible.value = true
}

// 编辑证书类型
const handleEdit = async (row) => {
  formMode.value = 'edit'
  try {
    const { data } = await getCertificateTypeDetail(row.id)
    Object.assign(form, data)
    dialogVisible.value = true
  } catch (error) {
    console.error('获取证书类型详情失败', error)
    ElMessage.error('获取证书类型详情失败')
  }
}

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (formMode.value === 'add') {
        await addCertificateType(form)
        ElMessage.success('添加证书类型成功')
      } else {
        await updateCertificateType(form.id, form)
        ElMessage.success('更新证书类型成功')
      }
      
      dialogVisible.value = false
      getCertificateTypeList()
    } catch (error) {
      console.error('保存证书类型失败', error)
      ElMessage.error('保存证书类型失败')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  form.id = undefined
  form.name = ''
  form.category = ''
  form.description = ''
  form.icon = ''
  form.issuingAuthority = ''
  form.validityYears = 0
  form.status = 1
}

// 改变状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await updateCertificateType(row.id, { ...row, status: newStatus })
    ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}证书类型成功`)
    getCertificateTypeList()
  } catch (error) {
    console.error('更新证书类型状态失败', error)
    ElMessage.error('更新证书类型状态失败')
  }
}

// 删除证书类型
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除证书类型"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCertificateType(row.id)
      ElMessage.success('删除证书类型成功')
      getCertificateTypeList()
    } catch (error) {
      console.error('删除证书类型失败', error)
      ElMessage.error('删除证书类型失败')
    }
  }).catch(() => {})
}

// 上传图标前检查
const beforeIconUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJpgOrPng) {
    ElMessage.error('图标只能是 JPG 或 PNG 格式!')
  }
  
  if (!isLt2M) {
    ElMessage.error('图标大小不能超过 2MB!')
  }
  
  return isJpgOrPng && isLt2M
}

// 自定义上传图标
const uploadIcon = async (options) => {
  try {
    const response = await uploadCertificateIcon(options.file)
    options.onSuccess(response)
  } catch (error) {
    options.onError(error)
  }
}

// 图标上传成功回调
const handleIconSuccess = (response) => {
  form.icon = response.data.url
}

// 生命周期
onMounted(() => {
  getCertificateTypeList()
})
</script>

<style scoped>
.certificate-types-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.icon-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-uploader:hover {
  border-color: #409eff;
}

.icon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-preview {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: contain;
}

.icon-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style> 