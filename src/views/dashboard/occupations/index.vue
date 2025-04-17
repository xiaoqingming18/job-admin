<template>
  <div class="occupations-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">工种管理</h2>
        <span class="subtitle">管理系统中的工种信息</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleAdd" v-if="isAdminUser">
          <el-icon><Plus /></el-icon>添加工种
        </el-button>
        <el-button type="success" @click="$router.push('/dashboard/occupations/category')" v-if="isAdminUser">
          <el-icon><FolderAdd /></el-icon>类别管理
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工种名称">
          <el-input v-model="searchForm.name" placeholder="请输入工种名称" clearable />
        </el-form-item>
        <el-form-item label="工种类别">
          <el-select v-model="searchForm.categoryId" placeholder="请选择工种类别" clearable>
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级">
          <el-select v-model="searchForm.difficultyLevel" placeholder="请选择难度等级" clearable>
            <el-option label="入门级 (1级)" :value="1" />
            <el-option label="基础级 (2级)" :value="2" />
            <el-option label="中级 (3级)" :value="3" />
            <el-option label="高级 (4级)" :value="4" />
            <el-option label="专家级 (5级)" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="日薪范围">
          <div class="wage-range">
            <el-input-number 
              v-model="searchForm.minWage" 
              :min="0" 
              :precision="0" 
              placeholder="最低日薪" 
              size="small" 
              style="width: 120px"
            />
            <span class="range-separator">至</span>
            <el-input-number 
              v-model="searchForm.maxWage" 
              :min="0" 
              :precision="0" 
              placeholder="最高日薪" 
              size="small" 
              style="width: 120px"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Delete /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 类别选项卡 -->
    <el-card class="categories-container" shadow="hover" v-if="!hasSearchFilters">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane label="全部工种" name="all" />
        <el-tab-pane 
          v-for="category in categoryOptions" 
          :key="category.id" 
          :label="category.name" 
          :name="category.id.toString()"
        />
      </el-tabs>
    </el-card>

    <!-- 工种卡片列表 -->
    <el-card v-loading="loading" class="occupation-cards-container" shadow="hover">
      <div class="card-grid">
        <div 
          v-for="item in occupationList" 
          :key="item.id" 
          class="occupation-card"
          :class="{ 'disabled': item.status === 0 }"
          @click="handleDetail(item)"
        >
          <div class="occupation-card-header">
            <div class="occupation-icon">
              <el-avatar :size="60" :src="item.icon" v-if="item.icon">
                <el-icon><Tools /></el-icon>
              </el-avatar>
              <el-icon v-else :size="36"><Tools /></el-icon>
            </div>
            <div class="occupation-status" v-if="isAdminUser">
              <el-switch
                v-model="item.status"
                :active-value="1"
                :inactive-value="0"
                @click.stop
                @change="(val) => handleStatusChange(item, val)"
              />
            </div>
          </div>
          <div class="occupation-info">
            <h3 class="occupation-name">{{ item.name }}</h3>
            <div class="occupation-category">{{ getCategoryName(item.categoryId) }}</div>
            <div class="occupation-difficulty">
              <el-rate
                v-model="item.difficultyLevel"
                disabled
                text-color="#ff9900"
              />
            </div>
            <div class="occupation-wage">{{ formatCurrency(item.averageDailyWage) }}/天</div>
          </div>
          <div class="occupation-actions" v-if="isAdminUser">
            <el-button link type="primary" @click.stop="handleEdit(item)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" @click.stop="handleDelete(item)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty description="暂无工种数据" v-if="occupationList.length === 0 && !loading"></el-empty>

      <!-- 分页 -->
      <div class="pagination-container" v-if="occupationList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 热门工种推荐 -->
    <el-card class="hot-occupations-container" shadow="hover" v-if="hotOccupations.length > 0">
      <template #header>
        <div class="card-header">
          <span>热门工种推荐</span>
        </div>
      </template>
      <el-carousel :interval="5000" type="card" height="200px">
        <el-carousel-item v-for="item in hotOccupations" :key="item.id" @click="handleDetail(item)">
          <div class="hot-occupation-card">
            <div class="hot-occupation-icon">
              <el-avatar :size="60" :src="item.icon" v-if="item.icon">
                <el-icon><Tools /></el-icon>
              </el-avatar>
              <el-icon v-else :size="36"><Tools /></el-icon>
            </div>
            <div class="hot-occupation-name">{{ item.name }}</div>
            <div class="hot-occupation-category">{{ getCategoryName(item.categoryId) }}</div>
            <div class="hot-occupation-wage">{{ formatCurrency(item.averageDailyWage) }}/天</div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </el-card>

    <!-- 工种详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="工种详情"
      size="35%"
      destroy-on-close
    >
      <div v-if="currentOccupation" class="occupation-details">
        <div class="occupation-detail-header">
          <el-avatar :size="80" :src="currentOccupation.icon" v-if="currentOccupation.icon">
            <el-icon><Tools /></el-icon>
          </el-avatar>
          <el-icon v-else :size="40"><Tools /></el-icon>
          <h2>{{ currentOccupation.name }}</h2>
          <el-tag 
            :type="currentOccupation.status === 1 ? 'success' : 'danger'"
            effect="dark"
          >
            {{ currentOccupation.status === 1 ? '启用中' : '已禁用' }}
          </el-tag>
        </div>

        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="所属类别">{{ getCategoryName(currentOccupation.categoryId) }}</el-descriptions-item>
          <el-descriptions-item label="日薪标准">{{ formatCurrency(currentOccupation.averageDailyWage) }} 元/天</el-descriptions-item>
          <el-descriptions-item label="难度等级">
            <el-rate
              v-model="currentOccupation.difficultyLevel"
              disabled
              show-score
              text-color="#ff9900"
            />
          </el-descriptions-item>
          <el-descriptions-item label="必备证书">
            <div v-if="currentOccupation.requiredCertificates && currentOccupation.requiredCertificates.length > 0">
              <el-tag v-for="cert in currentOccupation.requiredCertificates" :key="cert" class="certificate-tag">
                {{ cert }}
              </el-tag>
            </div>
            <span v-else>无需特定证书</span>
          </el-descriptions-item>
          <el-descriptions-item label="工种描述">{{ currentOccupation.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(currentOccupation.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新时间">{{ formatDateTime(currentOccupation.updateTime) || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button-group v-if="isAdminUser">
            <el-button type="primary" @click="handleEdit(currentOccupation)">编辑信息</el-button>
            <el-button type="warning" @click="handleStatusToggle">
              {{ currentOccupation.status === 1 ? '禁用工种' : '启用工种' }}
            </el-button>
            <el-button type="danger" @click="handleDelete(currentOccupation)">删除工种</el-button>
          </el-button-group>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 工种编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑工种' : '添加工种'"
      width="550px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="工种名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入工种名称" />
        </el-form-item>
        <el-form-item label="所属类别" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择所属类别" style="width: 100%">
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日薪标准" prop="averageDailyWage">
          <el-input-number 
            v-model="form.averageDailyWage" 
            :min="0" 
            :precision="0" 
            :step="50" 
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="难度等级" prop="difficultyLevel">
          <el-rate v-model="form.difficultyLevel" show-score text-color="#ff9900" style="margin-top: 8px;" />
        </el-form-item>
        <el-form-item label="必备证书" prop="requiredCertificates">
          <el-select
            v-model="form.requiredCertificates"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入必备证书"
            style="width: 100%"
          >
            <el-option
              v-for="certificate in certificateOptions"
              :key="certificate"
              :label="certificate"
              :value="certificate"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工种描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入工种描述" 
          />
        </el-form-item>
        <el-form-item label="工种图标" prop="icon">
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
                <el-icon><Tools /></el-icon>
              </el-avatar>
              <el-link type="danger" @click="removeIcon" class="remove-icon">
                <el-icon><Delete /></el-icon>
                移除图标
              </el-link>
            </div>
          </div>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, UploadFile } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  View,
  FolderAdd,
  Tools,
  Upload
} from '@element-plus/icons-vue'
import { 
  getOccupationPage, 
  getOccupationInfo, 
  getOccupationCategoryList,
  getOccupationByCategory,
  deleteOccupation,
  addOccupation,
  updateOccupation,
  updateOccupationStatus,
  searchOccupation,
  getHotOccupations
} from '@/api/occupation'
import { upload } from '@/api/file'
import { isAdmin } from '@/utils/auth'
import type { 
  Occupation, 
  OccupationListItem, 
  OccupationSearchParams,
  OccupationCategory,
  AddOccupationParams,
  UpdateOccupationParams,
  UpdateOccupationStatusParams
} from '@/types/occupation'

const route = useRoute()
const router = useRouter()

const isAdminUser = computed(() => isAdmin())

// 格式化货币
const formatCurrency = (value: number) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
    .format(value)
    .replace(/\.00$/, '')
}

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

// 工种列表数据
const occupationList = ref<OccupationListItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 热门工种
const hotOccupations = ref<OccupationListItem[]>([])

// 工种类别
const categoryOptions = ref<OccupationCategory[]>([])
const activeCategory = ref('all')

// 搜索表单
const searchForm = reactive<OccupationSearchParams>({
  name: '',
  categoryId: undefined,
  minWage: undefined,
  maxWage: undefined,
  difficultyLevel: undefined
})

// 证书选项（示例数据，实际可从后端获取或单独管理）
const certificateOptions = ref([
  '建筑工人证',
  '电工证',
  '焊工证',
  '高空作业证',
  '搅拌车驾驶证',
  '木工证',
  '架子工证',
  '安全操作证',
  '特种设备作业人员证'
])

// 是否有搜索条件
const hasSearchFilters = computed(() => {
  return searchForm.name || 
         searchForm.minWage !== undefined || 
         searchForm.maxWage !== undefined ||
         searchForm.difficultyLevel !== undefined
})

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = ''
  searchForm.categoryId = undefined
  searchForm.minWage = undefined
  searchForm.maxWage = undefined
  searchForm.difficultyLevel = undefined
  activeCategory.value = 'all'
  fetchData()
}

// 执行搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 获取工种列表数据
const fetchData = async () => {
  loading.value = true
  try {
    // 构建搜索参数
    const params: OccupationSearchParams = {
      ...searchForm,
      page: currentPage.value,
      size: pageSize.value
    }

    let res: any

    // 判断是否有搜索条件
    if (hasSearchFilters.value) {
      // 使用搜索接口
      res = await searchOccupation(params)
      
      if (res.code === 0) {
        if (Array.isArray(res.data)) {
          // 如果返回的是数组，直接使用
          occupationList.value = res.data
          total.value = res.data.length
        } else {
          // 如果返回的是分页数据
          occupationList.value = res.data.records || []
          total.value = res.data.total || 0
        }
      } else {
        throw new Error(res.message || '搜索工种失败')
      }
    } else if (activeCategory.value !== 'all') {
      // 按类别查询
      const categoryId = parseInt(activeCategory.value)
      res = await getOccupationByCategory(categoryId)
      
      if (res.code === 0) {
        occupationList.value = res.data || []
        total.value = res.data.length
      } else {
        throw new Error(res.message || '获取分类工种失败')
      }
    } else {
      // 使用分页接口
      res = await getOccupationPage({
        page: currentPage.value,
        size: pageSize.value
      })
      
      if (res.code === 0 && res.data) {
        occupationList.value = res.data.records || []
        total.value = res.data.total || 0
        currentPage.value = res.data.current || 1
        pageSize.value = res.data.size || 12
      } else {
        throw new Error(res.message || '获取工种列表失败')
      }
    }
  } catch (error: any) {
    console.error('获取工种列表失败', error)
    ElMessage.error(error.message || '获取工种列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 获取热门工种
const fetchHotOccupations = async () => {
  try {
    const res = await getHotOccupations(6)
    if (res.code === 0 && res.data) {
      hotOccupations.value = res.data
    }
  } catch (error) {
    console.error('获取热门工种失败', error)
  }
}

// 获取工种类别列表
const fetchCategories = async () => {
  try {
    const res = await getOccupationCategoryList()
    if (res.code === 0 && res.data) {
      categoryOptions.value = res.data
    }
  } catch (error) {
    console.error('获取工种类别列表失败', error)
  }
}

// 类别标签切换
const handleCategoryChange = (tabName: string) => {
  currentPage.value = 1
  activeCategory.value = tabName
  
  if (tabName !== 'all') {
    searchForm.categoryId = parseInt(tabName)
  } else {
    searchForm.categoryId = undefined
  }
  
  fetchData()
}

// 通过categoryId获取类别名称
const getCategoryName = (categoryId: number) => {
  const category = categoryOptions.value.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

// 刷新数据
const refreshData = () => {
  fetchCategories().then(() => {
    // 如果URL中有categoryId参数，设置激活的类别
    if (route.query.categoryId) {
      activeCategory.value = route.query.categoryId as string
      searchForm.categoryId = parseInt(route.query.categoryId as string)
    }
    fetchData()
  })
  fetchHotOccupations()
}

// 页码和每页数量变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  fetchData()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchData()
}

// 工种详情抽屉
const drawerVisible = ref(false)
const currentOccupation = ref<Occupation | null>(null)

// 查看工种详情
const handleDetail = async (row: OccupationListItem) => {
  try {
    const res = await getOccupationInfo(row.id)
    if (res.code === 0 && res.data) {
      currentOccupation.value = res.data
      drawerVisible.value = true
    } else {
      throw new Error(res.message || '获取工种详情失败')
    }
  } catch (error: any) {
    console.error('获取工种详情失败', error)
    ElMessage.error(error.message || '获取工种详情失败，请稍后再试')
  }
}

// 切换工种状态
const handleStatusChange = async (occupation: OccupationListItem, newStatus: number) => {
  try {
    const params: UpdateOccupationStatusParams = {
      id: occupation.id,
      status: newStatus
    }
    
    const res = await updateOccupationStatus(params)
    if (res.code === 0) {
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}工种成功`)
      fetchData()
    } else {
      throw new Error(res.message || '更新工种状态失败')
    }
  } catch (error: any) {
    console.error('更新工种状态失败', error)
    ElMessage.error(error.message || '更新工种状态失败，请稍后再试')
    // 回滚状态变更
    occupation.status = occupation.status === 1 ? 0 : 1
  }
}

// 在详情抽屉中切换工种状态
const handleStatusToggle = async () => {
  if (!currentOccupation.value) return
  
  const newStatus = currentOccupation.value.status === 1 ? 0 : 1
  try {
    const params: UpdateOccupationStatusParams = {
      id: currentOccupation.value.id,
      status: newStatus
    }
    
    const res = await updateOccupationStatus(params)
    if (res.code === 0) {
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}工种成功`)
      currentOccupation.value.status = newStatus
      fetchData()
    } else {
      throw new Error(res.message || '更新工种状态失败')
    }
  } catch (error: any) {
    console.error('更新工种状态失败', error)
    ElMessage.error(error.message || '更新工种状态失败，请稍后再试')
  }
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
  categoryId: number | undefined
  description: string
  icon: string
  requiredCertificates: string[]
  averageDailyWage: number
  difficultyLevel: number
}>({
  name: '',
  categoryId: undefined,
  description: '',
  icon: '',
  requiredCertificates: [],
  averageDailyWage: 300,
  difficultyLevel: 3
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入工种名称', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择所属类别', trigger: 'change' }
  ],
  averageDailyWage: [
    { required: true, message: '请输入日薪标准', trigger: 'blur' }
  ],
  difficultyLevel: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
  ]
}

// 编辑工种
const handleEdit = (row: Occupation | OccupationListItem) => {
  isEdit.value = true
  
  // 如果是从列表项点击，需要先获取详情
  if (!('description' in row)) {
    handleDetail(row).then(() => {
      if (currentOccupation.value) {
        setFormData(currentOccupation.value)
      }
    })
  } else {
    setFormData(row as Occupation)
  }
  
  dialogVisible.value = true
  drawerVisible.value = false
}

// 设置表单数据
const setFormData = (occupation: Occupation) => {
  form.id = occupation.id
  form.name = occupation.name
  form.categoryId = occupation.categoryId
  form.description = occupation.description || ''
  form.icon = occupation.icon || ''
  form.requiredCertificates = occupation.requiredCertificates || []
  form.averageDailyWage = occupation.averageDailyWage
  form.difficultyLevel = occupation.difficultyLevel
}

// 添加工种
const handleAdd = () => {
  isEdit.value = false
  form.id = undefined
  form.name = ''
  form.categoryId = activeCategory.value !== 'all' ? parseInt(activeCategory.value) : undefined
  form.description = ''
  form.icon = ''
  form.requiredCertificates = []
  form.averageDailyWage = 300 // 默认值
  form.difficultyLevel = 3 // 默认值
  
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
          // 更新工种
          const updateParams: UpdateOccupationParams = {
            id: form.id,
            name: form.name,
            categoryId: form.categoryId,
            description: form.description || undefined,
            icon: form.icon || undefined,
            requiredCertificates: form.requiredCertificates,
            averageDailyWage: form.averageDailyWage,
            difficultyLevel: form.difficultyLevel
          }
          
          await updateOccupation(updateParams)
          ElMessage.success('更新工种信息成功')
        } else {
          // 添加工种
          if (!form.categoryId) {
            ElMessage.error('请选择所属类别')
            submitting.value = false
            return
          }
          
          const addParams: AddOccupationParams = {
            name: form.name,
            categoryId: form.categoryId,
            description: form.description || undefined,
            icon: form.icon || undefined,
            requiredCertificates: form.requiredCertificates,
            averageDailyWage: form.averageDailyWage,
            difficultyLevel: form.difficultyLevel
          }
          
          await addOccupation(addParams)
          ElMessage.success('添加工种成功')
        }
        dialogVisible.value = false
        refreshData()
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || (isEdit.value ? '更新工种信息失败' : '添加工种失败')
        ElMessage.error(errorMessage)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除工种
const handleDelete = (row: OccupationListItem | Occupation) => {
  ElMessageBox.confirm(
    `确定要删除工种 "${row.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteOccupation(row.id)
      ElMessage.success('删除工种成功')
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
      refreshData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除工种失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 监听路由参数变化
watch(() => route.query, (query) => {
  if (query.categoryId) {
    activeCategory.value = query.categoryId as string
    searchForm.categoryId = parseInt(query.categoryId as string)
  } else {
    activeCategory.value = 'all'
    searchForm.categoryId = undefined
  }
  fetchData()
}, { immediate: true })

// 加载初始数据
onMounted(() => {
  fetchCategories().then(() => {
    // 如果URL中有categoryId参数，设置激活的类别
    if (route.query.categoryId) {
      activeCategory.value = route.query.categoryId as string
      searchForm.categoryId = parseInt(route.query.categoryId as string)
    }
    fetchData()
  })
  fetchHotOccupations()
})
</script>

<style scoped>
.occupations-container {
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

.filter-container {
  margin-bottom: 24px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.wage-range {
  display: flex;
  align-items: center;
}

.range-separator {
  margin: 0 10px;
  color: #909399;
}

.categories-container {
  margin-bottom: 24px;
}

.occupation-cards-container {
  margin-bottom: 24px;
  min-height: 300px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.occupation-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.occupation-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.occupation-card.disabled {
  opacity: 0.6;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
}

.occupation-card.disabled:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transform: none;
}

.occupation-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.occupation-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.occupation-status {
  position: absolute;
  top: 15px;
  right: 15px;
}

.occupation-info {
  text-align: center;
}

.occupation-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.occupation-category {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  padding: 2px 8px;
  background-color: #f0f2f5;
  border-radius: 12px;
  display: inline-block;
}

.occupation-difficulty {
  margin-bottom: 10px;
}

.occupation-wage {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 10px;
}

.occupation-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.occupation-card:hover .occupation-actions {
  opacity: 1;
}

.hot-occupations-container {
  margin-bottom: 24px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.hot-occupation-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.hot-occupation-icon {
  margin-bottom: 15px;
}

.hot-occupation-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.hot-occupation-category {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  padding: 2px 8px;
  background-color: #f0f2f5;
  border-radius: 12px;
  display: inline-block;
}

.hot-occupation-wage {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.occupation-details {
  padding: 0 20px;
}

.occupation-detail-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #ebeef5;
}

.occupation-detail-header h2 {
  margin: 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.detail-descriptions {
  margin: 20px 0;
}

.certificate-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.drawer-footer {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
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

:deep(.el-carousel__item) {
  cursor: pointer;
}
</style> 