<template>
  <div class="occupation-category-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">工种类别管理</h2>
        <span class="subtitle">管理系统中的工种类别信息</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleAdd" v-if="isAdmin">
          <el-icon><Plus /></el-icon>添加类别
        </el-button>
        <el-button @click="fetchCategories">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <el-button @click="$router.push('/dashboard/occupations')">
          <el-icon><Back /></el-icon>返回工种列表
        </el-button>
      </div>
    </div>

    <!-- 类别列表 -->
    <el-card class="list-container" shadow="hover" v-loading="loading">
      <el-table 
        :data="categoryList" 
        border 
        stripe 
        style="width: 100%"
        highlight-current-row
        @row-click="handleDetail"
      >
        <el-table-column type="index" width="60" align="center" label="#" />
        <el-table-column label="类别图标" width="100" align="center">
          <template #default="scope">
            <el-avatar 
              :size="40" 
              :src="scope.row.icon" 
              v-if="scope.row.icon"
            >
              <el-icon><FolderOpened /></el-icon>
            </el-avatar>
            <el-icon v-else :size="24"><FolderOpened /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="类别名称" min-width="150" />
        <el-table-column prop="description" label="类别描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="100" align="center" />
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180" align="center">
          <template #default="scope">
            <template v-if="isAdmin">
              <el-button link type="primary" @click.stop="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button link type="danger" @click.stop="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
            <el-button link type="primary" @click.stop="goToOccupationList(scope.row)">
              <el-icon><View /></el-icon>查看工种
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 类别详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="类别详情"
      size="30%"
      destroy-on-close
    >
      <div v-if="currentCategory" class="category-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="类别名称">{{ currentCategory.name }}</el-descriptions-item>
          <el-descriptions-item label="类别图标">
            <el-avatar 
              :size="60" 
              :src="currentCategory.icon" 
              v-if="currentCategory.icon"
            >
              <el-icon><FolderOpened /></el-icon>
            </el-avatar>
            <el-icon v-else :size="36"><FolderOpened /></el-icon>
          </el-descriptions-item>
          <el-descriptions-item label="类别描述">{{ currentCategory.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ currentCategory.sortOrder }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(currentCategory.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新时间">{{ formatDateTime(currentCategory.updateTime) || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button type="primary" @click="handleEdit(currentCategory)" v-if="isAdmin">编辑信息</el-button>
          <el-button type="success" @click="goToOccupationList(currentCategory)">查看工种</el-button>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 类别编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑工种类别' : '添加工种类别'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="类别图标" prop="icon">
          <div class="icon-upload">
            <el-upload
              class="upload-component"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleIconChange"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon>
                选择图标
              </el-button>
            </el-upload>
            <div class="icon-preview" v-if="form.icon">
              <el-avatar :size="60" :src="form.icon">
                <el-icon><FolderOpened /></el-icon>
              </el-avatar>
              <el-link type="danger" @click="removeIcon" class="remove-icon">
                <el-icon><Delete /></el-icon>
                移除图标
              </el-link>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="类别描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入类别描述" 
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number 
            v-model="form.sortOrder" 
            :min="1" 
            :precision="0" 
            :step="1" 
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, UploadFile } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Refresh,
  View,
  Back,
  FolderOpened,
  Upload
} from '@element-plus/icons-vue'
import { 
  getOccupationCategoryList,
  getOccupationCategoryInfo,
  addOccupationCategory,
  updateOccupationCategory,
  deleteOccupationCategory
} from '@/api/occupation'
import { upload } from '@/api/file'
import { isAdmin as checkIsAdmin } from '@/utils/auth'
import type { 
  OccupationCategory,
  AddOccupationCategoryParams
} from '@/types/occupation'

const router = useRouter()

// 格式化日期时间
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date).replace(/\//g, '-')
}

// 类别列表数据
const categoryList = ref<OccupationCategory[]>([])
const loading = ref(false)

// 获取工种类别列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getOccupationCategoryList()
    if (res.code === 0 && res.data) {
      categoryList.value = res.data
    } else {
      throw new Error(res.message || '获取工种类别列表失败')
    }
  } catch (error: any) {
    console.error('获取工种类别列表失败', error)
    ElMessage.error(error.message || '获取工种类别列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 类别详情抽屉
const drawerVisible = ref(false)
const currentCategory = ref<OccupationCategory | null>(null)

// 查看类别详情
const handleDetail = async (row: OccupationCategory) => {
  try {
    const res = await getOccupationCategoryInfo(row.id)
    if (res.code === 0 && res.data) {
      currentCategory.value = res.data
      drawerVisible.value = true
    } else {
      throw new Error(res.message || '获取类别详情失败')
    }
  } catch (error: any) {
    console.error('获取类别详情失败', error)
    ElMessage.error(error.message || '获取类别详情失败，请稍后再试')
  }
}

// 查看该类别下的工种列表
const goToOccupationList = (category: OccupationCategory) => {
  router.push({
    path: '/dashboard/occupations',
    query: { categoryId: category.id.toString() }
  })
}

// 编辑表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<{
  id?: number
  name: string
  icon: string
  description: string
  sortOrder: number
}>({
  name: '',
  icon: '',
  description: '',
  sortOrder: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入类别名称', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序序号', trigger: 'blur' }
  ]
}

// 编辑类别
const handleEdit = (row: OccupationCategory) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.icon = row.icon || ''
  form.description = row.description || ''
  form.sortOrder = row.sortOrder || 1
  
  dialogVisible.value = true
  drawerVisible.value = false
}

// 添加类别
const handleAdd = () => {
  isEdit.value = false
  form.id = undefined
  form.name = ''
  form.icon = ''
  form.description = ''
  form.sortOrder = categoryList.value.length + 1
  
  dialogVisible.value = true
}

// 图标上传相关
const uploading = ref(false)

// 处理图标文件变化
const handleIconChange = async (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error('文件上传失败')
    return
  }

  // 验证文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  // 验证文件大小（2MB）
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return
  }

  uploading.value = true
  try {
    const res = await upload(file.raw, 'occupation-icons')
    if (res.code === 0 && res.data) {
      form.icon = res.data.url
      ElMessage.success('图标上传成功')
    } else {
      throw new Error(res.message || '图标上传失败')
    }
  } catch (error: any) {
    console.error('图标上传失败', error)
    ElMessage.error(error.message || '图标上传失败，请稍后再试')
  } finally {
    uploading.value = false
  }
}

// 移除图标
const removeIcon = () => {
  form.icon = ''
  ElMessage.success('已移除图标')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value && form.id) {
          await updateOccupationCategory({
            id: form.id,
            name: form.name,
            icon: form.icon || undefined,
            description: form.description || undefined,
            sortOrder: form.sortOrder
          })
          ElMessage.success('更新类别信息成功')
        } else {
          const params: AddOccupationCategoryParams = {
            name: form.name,
            sortOrder: form.sortOrder,
          }
          if (form.icon) params.icon = form.icon
          if (form.description) params.description = form.description
          
          await addOccupationCategory(params)
          ElMessage.success('添加类别成功')
        }
        dialogVisible.value = false
        fetchCategories()
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || (isEdit.value ? '更新类别信息失败' : '添加类别失败')
        ElMessage.error(errorMessage)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除类别
const handleDelete = (row: OccupationCategory) => {
  ElMessageBox.confirm(
    `确定要删除类别 "${row.name}" 吗？此操作会同时删除该类别下的所有工种，不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteOccupationCategory(row.id)
      ElMessage.success('删除类别成功')
      fetchCategories()
    } catch (error: any) {
      ElMessage.error(error.message || '删除类别失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 管理员权限检查计算属性
const isAdmin = computed(() => {
  return checkIsAdmin()
})

// 加载初始数据
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.occupation-category-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
}

.actions-section {
  display: flex;
  gap: 12px;
}

.list-container {
  margin-bottom: 24px;
}

.category-details {
  padding: 0 20px;
}

.drawer-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.icon-upload {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.remove-icon {
  font-size: 12px;
}

.remove-icon :deep(.el-icon) {
  margin-right: 4px;
}
</style> 