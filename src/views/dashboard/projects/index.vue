<template>
  <div class="projects-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">项目管理</h2>
        <span class="subtitle">管理系统中的建筑项目信息</span>
      </div>
      <div class="actions-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加项目
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="searchForm.status" placeholder="请选择项目状态" clearable>
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="searchForm.projectType" placeholder="请选择项目类型" clearable>
            <el-option label="住宅建筑" value="residence" />
            <el-option label="商业建筑" value="commerce" />
            <el-option label="工业建筑" value="industry" />
            <el-option label="市政工程" value="municipal" />
          </el-select>
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

    <!-- 项目列表 -->
    <el-card class="list-container" shadow="hover">
      <el-table 
        v-loading="loading" 
        :data="projectList" 
        border 
        stripe 
        style="width: 100%"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="50" align="center" label="#" />
        <el-table-column prop="name" label="项目名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="companyName" label="所属企业" min-width="180" show-overflow-tooltip />
        <el-table-column prop="address" label="项目地址" min-width="240" show-overflow-tooltip />
        <el-table-column label="项目规模" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getScaleType(scope.row.projectScale)">
              {{ formatProjectScale(scope.row.projectScale) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="项目状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始日期" width="110" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column label="预计结束日期" width="110" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.expectedEndDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button link type="primary" @click.stop="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="primary" @click.stop="handleDetail(scope.row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button link type="danger" @click.stop="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 项目详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="项目详情"
      size="30%"
      :destroy-on-close="true"
    >
      <div v-if="currentProject" class="project-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="项目名称">{{ currentProject.name }}</el-descriptions-item>
          <el-descriptions-item label="所属企业">{{ currentProject.companyName }}</el-descriptions-item>
          <el-descriptions-item label="项目经理">{{ currentProject.projectManagerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所在地区">
            {{ `${currentProject.province || '-'}/${currentProject.city || '-'}/${currentProject.district || '-'}` }}
          </el-descriptions-item>
          <el-descriptions-item label="项目类型">{{ formatProjectType(currentProject.projectType) }}</el-descriptions-item>
          <el-descriptions-item label="项目规模">{{ formatProjectScale(currentProject.projectScale) }}</el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="getStatusType(currentProject.status)">
              {{ formatStatus(currentProject.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ formatDate(currentProject.startDate) }}</el-descriptions-item>
          <el-descriptions-item label="预计结束日期">{{ formatDate(currentProject.expectedEndDate) }}</el-descriptions-item>
          <el-descriptions-item label="总面积">{{ currentProject.totalArea }} 平方米</el-descriptions-item>
          <el-descriptions-item label="预算">{{ formatBudget(currentProject.budget) }} 元</el-descriptions-item>
          <el-descriptions-item label="描述">{{ currentProject.description || '暂无描述' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentProject.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-footer">
          <el-button type="primary" @click="handleEdit(currentProject)">编辑信息</el-button>
          <el-button @click="drawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 项目编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑项目' : '添加项目'"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        status-icon
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="所属企业" prop="companyId" v-if="!isEdit && isAdmin()">
          <el-select v-model="form.companyId" placeholder="请选择所属企业" filterable @change="handleCompanyChange">
            <el-option 
              v-for="company in companyOptions" 
              :key="company.id" 
              :label="company.name" 
              :value="company.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目经理" prop="projectManagerId">
          <el-select v-model="form.projectManagerId" placeholder="请选择项目经理" filterable>
            <el-option 
              v-for="manager in projectManagerOptions" 
              :key="manager.id" 
              :label="manager.name" 
              :value="manager.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所在地区" prop="areaCode">
          <el-cascader
            v-model="form.areaCode"
            :options="regionData"
            :props="{ expandTrigger: 'hover' }"
            placeholder="请选择所在地区"
            @change="handleAreaChange"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="form.projectType" placeholder="请选择项目类型">
            <el-option label="住宅建筑" value="residence" />
            <el-option label="商业建筑" value="commerce" />
            <el-option label="工业建筑" value="industry" />
            <el-option label="市政工程" value="municipal" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目规模" prop="projectScale">
          <el-select v-model="form.projectScale" placeholder="请选择项目规模">
            <el-option label="小型" value="small" />
            <el-option label="中型" value="medium" />
            <el-option label="大型" value="big" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="预计结束日期" prop="expectedEndDate">
          <el-date-picker
            v-model="form.expectedEndDate"
            type="date"
            placeholder="选择预计结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="总面积(㎡)" prop="totalArea">
          <el-input-number v-model="form.totalArea" :min="0" :precision="2" :step="100" />
        </el-form-item>
        <el-form-item label="预算(元)" prop="budget">
          <el-input-number v-model="form.budget" :min="0" :precision="2" :step="10000" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status" v-if="isEdit">
          <el-select v-model="form.status" placeholder="请选择项目状态">
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  View
} from '@element-plus/icons-vue'
import { getProjectList, updateProject, deleteProject, addProject, getCompanyProjectList } from '@/api/project'
import { getCompanyList, getCompanyManagerList } from '@/api/company'
import { isAdmin, isCompanyAdmin, isProjectManager } from '@/utils/auth'
import { useCompanyStore } from '@/stores/company'
import { regionData, codeToText } from 'element-china-area-data'
import type { Project, ProjectStatus } from '@/types/project'
import type { ProjectManager } from '@/types/company'

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\//g, '-')
}

// 格式化项目状态
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    paused: '已暂停',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态对应的类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    in_progress: 'primary',
    completed: 'success',
    paused: 'warning',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

// 格式化项目类型
const formatProjectType = (type: string) => {
  const typeMap: Record<string, string> = {
    residence: '住宅建筑',
    commerce: '商业建筑',
    industry: '工业建筑',
    municipal: '市政工程'
  }
  return typeMap[type] || type
}

// 格式化项目规模
const formatProjectScale = (scale: string) => {
  const scaleMap: Record<string, string> = {
    small: '小型',
    medium: '中型',
    big: '大型'
  }
  return scaleMap[scale] || scale
}

// 获取规模对应的类型
const getScaleType = (scale: string) => {
  const typeMap: Record<string, string> = {
    small: 'info',
    medium: 'warning',
    big: 'danger'
  }
  return typeMap[scale] || ''
}

// 格式化预算
const formatBudget = (budget: number) => {
  if (!budget) return '-'
  return new Intl.NumberFormat('zh-CN').format(budget)
}

// 项目列表数据
const projectList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  projectType: ''
})

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.projectType = ''
  fetchData()
}

// 执行搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 获取企业列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const companyStore = useCompanyStore()

    if ((isCompanyAdmin() || isProjectManager()) && companyStore.companyId) {
      // 企业管理员和项目经理只能查看自己企业的项目
      const res = await getCompanyProjectList({
        companyId: companyStore.companyId,
        pageNum: currentPage.value,
        pageSize: pageSize.value
      })
      if (res.code === 0) {
        // 为项目添加企业名称
        const companyName = companyStore.companyName || '';
        const projectsWithCompanyName = res.data.map((project: any) => {
          if (!project.companyName) {
            return { ...project, companyName }
          }
          return project
        })
        
        projectList.value = projectsWithCompanyName || []
        total.value = res.data.length // 由于没有分页信息，使用数组长度作为总数
        currentPage.value = 1 // 固定为第一页
        pageSize.value = res.data.length // 页大小设置为数组长度
      } else {
        throw new Error(res.message || '获取项目列表失败')
      }
    } else if (isAdmin()) {
      // 系统管理员可以查看所有项目
      const res = await getProjectList({
        keyword: searchForm.name,
        status: searchForm.status,
        projectType: searchForm.projectType,
        page: currentPage.value,
        size: pageSize.value
      })
      
      if (res.code === 0 && res.data) {
        // 处理企业名称信息
        const projectsWithCompanyName = res.data.list.map((project: any) => {
          // 如果项目中已包含companyName则直接使用，否则根据companyId查找
          if (!project.companyName && project.companyId) {
            // 尝试查找企业名称
            const company = companyOptions.value.find(c => c.id === project.companyId)
            if (company) {
              return { ...project, companyName: company.name }
            }
          }
          return project
        })
        
        projectList.value = projectsWithCompanyName || []
        total.value = res.data.total || 0
        currentPage.value = res.data.pageNum || 1
        pageSize.value = res.data.pageSize || 10
      } else {
        throw new Error(res.message || '获取项目列表失败')
      }
    } else {
      throw new Error('无权限访问项目列表')
    }
  } catch (error: any) {
    console.error('获取项目列表失败', error)
    ElMessage.error(error.message || '获取项目列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 刷新列表
const refreshList = () => {
  fetchData()
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

// 点击行
const handleRowClick = (row: any) => {
  handleDetail(row)
}

// 项目详情抽屉
const drawerVisible = ref(false)
const currentProject = ref<any>(null)

// 查看项目详情
const handleDetail = (row: any) => {
  currentProject.value = row
  drawerVisible.value = true
}

// 企业选项
const companyOptions = ref<Array<{ id: number; name: string }>>([])

// 项目经理选项
const projectManagerOptions = ref<Array<{ id: number; name: string }>>([])

// 获取企业列表
const fetchCompanyList = async () => {
  try {
    const res = await getCompanyList({
      current: 1,
      size: 1000 // 获取所有企业，用于下拉选择
    })
    companyOptions.value = (res.data.records || []).map((item: any) => ({
      id: item.id,
      name: item.name
    }))
  } catch (error) {
    console.error('获取企业列表失败', error)
    ElMessage.error('获取企业列表失败，请稍后再试')
  }
}

// 监听企业选择变更，加载对应企业的项目经理
const handleCompanyChange = async (companyId: number) => {
  if (!companyId) {
    projectManagerOptions.value = []
    form.projectManagerId = undefined
    return
  }
  
  try {
    const res = await getCompanyManagerList(companyId)
    if (res.code === 0 && res.data) {
      // 转换项目经理数据为下拉选项格式
      projectManagerOptions.value = res.data.map((manager: ProjectManager) => ({
        id: manager.userId,
        name: `${manager.username}${manager.position ? ` (${manager.position})` : ''}`
      }))
    } else {
      throw new Error(res.message || '获取项目经理列表失败')
    }
  } catch (error: any) {
    console.error('获取项目经理列表失败:', error)
    ElMessage.error(error.message || '获取项目经理列表失败，请稍后再试')
    projectManagerOptions.value = []
  }
}

// 加载当前企业的项目经理列表
const loadManagerListForCurrentCompany = async () => {
  const companyStore = useCompanyStore()
  if (companyStore.companyId) {
    try {
      const res = await getCompanyManagerList(companyStore.companyId)
      if (res.code === 0 && res.data) {
        projectManagerOptions.value = res.data.map((manager: ProjectManager) => ({
          id: manager.userId,
          name: `${manager.username}${manager.position ? ` (${manager.position})` : ''}`
        }))
      }
    } catch (error) {
      console.error('获取项目经理列表失败:', error)
    }
  }
}

// 编辑表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 在 form reactive 对象中添加项目经理ID字段
const form = reactive({
  id: 0,
  name: '',
  companyId: undefined as number | undefined,
  projectManagerId: undefined as number | undefined, // 项目经理ID
  areaCode: [], // 省市区编码数组
  areaText: '', // 省市区文本
  province: '', // 省份
  city: '', // 城市
  district: '', // 区县
  address: '',
  projectType: '',
  projectScale: '',
  startDate: '',
  expectedEndDate: '',
  totalArea: 0,
  budget: 0,
  description: '',
  status: 'pending'
})

// 在项目表单的验证规则中添加项目经理字段验证
const rules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  companyId: [
    { required: isAdmin, message: '请选择所属企业', trigger: 'change' }
  ],
  projectManagerId: [
    { required: true, message: '请选择项目经理', trigger: 'change' }
  ],
  areaCode: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  projectType: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  projectScale: [
    { required: true, message: '请选择项目规模', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  expectedEndDate: [
    { required: true, message: '请选择预计结束日期', trigger: 'change' }
  ],
  totalArea: [
    { required: true, message: '请输入总面积', trigger: 'blur' }
  ],
  budget: [
    { required: true, message: '请输入预算', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ]
}

// 修改处理区域选择变化的方法
const handleAreaChange = (value: string[]) => {
  if (value && value.length > 0) {
    const area = value.map(code => codeToText[code]).join('/')
    form.areaText = area
    // 设置省市区字段
    form.province = value[0] || ''
    form.city = value[1] || ''
    form.district = value[2] || ''
  } else {
    form.areaText = ''
    form.province = ''
    form.city = ''
    form.district = ''
  }
}

// 编辑项目
const handleEdit = async (row: any) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.companyId = row.companyId
  form.projectManagerId = row.projectManagerId
  
  // 如果项目有关联企业，加载该企业的项目经理列表
  if (row.companyId) {
    try {
      const res = await getCompanyManagerList(row.companyId)
      if (res.code === 0 && res.data) {
        projectManagerOptions.value = res.data.map((manager: ProjectManager) => ({
          id: manager.userId,
          name: `${manager.username}${manager.position ? ` (${manager.position})` : ''}`
        }))
      }
    } catch (error) {
      console.error('获取项目经理列表失败:', error)
    }
  }
  
  // 处理区域数据
  const province = row.province
  const city = row.city
  const district = row.district
  
  if (province && city && district) {
    try {
      // 从 regionData 中查找对应的编码
      const codes = []
      let currentLevel = regionData
      
      // 查找省级编码
      const provinceNode = currentLevel.find((item: any) => item.label === province)
      if (provinceNode) {
        codes.push(provinceNode.value)
        currentLevel = provinceNode.children || []
        
        // 查找市级编码
        const cityNode = currentLevel.find((item: any) => item.label === city)
        if (cityNode) {
          codes.push(cityNode.value)
          currentLevel = cityNode.children || []
          
          // 查找区级编码
          const districtNode = currentLevel.find((item: any) => item.label === district)
          if (districtNode) {
            codes.push(districtNode.value)
          }
        }
      }
      
      if (codes.length === 3) {
        form.areaCode = codes
      } else {
        form.areaCode = []
      }
    } catch (error) {
      console.error('解析地区编码失败:', error)
      form.areaCode = []
    }
  } else {
    form.areaCode = []
  }
  
  // 设置省市区字段
  form.province = province || ''
  form.city = city || ''
  form.district = district || ''
  
  form.address = row.address || ''
  form.projectType = row.projectType || ''
  form.projectScale = row.projectScale || ''
  form.startDate = row.startDate || ''
  form.expectedEndDate = row.expectedEndDate || ''
  form.totalArea = row.totalArea || 0
  form.budget = row.budget || 0
  form.description = row.description || ''
  form.status = row.status || 'pending'
  
  dialogVisible.value = true
  drawerVisible.value = false
}

// 添加项目
const handleAdd = async () => {
  isEdit.value = false
  form.id = 0
  form.name = ''
  form.companyId = undefined
  form.projectManagerId = undefined
  form.areaCode = []
  form.areaText = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.address = ''
  form.projectType = ''
  form.projectScale = ''
  form.startDate = ''
  form.expectedEndDate = ''
  form.totalArea = 0
  form.budget = 0
  form.description = ''
  form.status = 'pending'
  
  dialogVisible.value = true
  
  // 只有系统管理员需要选择企业
  if (isAdmin() && companyOptions.value.length === 0) {
    await fetchCompanyList()
  } else {
    // 企业管理员和项目经理自动使用所属企业
    const companyStore = useCompanyStore()
    if (companyStore.companyId) {
      form.companyId = companyStore.companyId
      // 加载该企业的项目经理
      await loadManagerListForCurrentCompany()
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const formData = { ...form }
      
      // 处理地区数据
      if (formData.areaCode && formData.areaCode.length === 3) {
        formData.province = codeToText[formData.areaCode[0]]
        formData.city = codeToText[formData.areaCode[1]]
        formData.district = codeToText[formData.areaCode[2]]
      }
      
      // 如果是企业管理员，确保使用当前企业ID
      if (!isAdmin()) {
        const companyStore = useCompanyStore()
        if (companyStore.companyId) {
          formData.companyId = companyStore.companyId
        } else {
          throw new Error('无法获取企业信息，请刷新页面重试')
        }
      }
      
      try {
        loading.value = true
        if (isEdit.value) {
          await updateProject(formData)
          ElMessage.success('修改成功')
        } else {
          await addProject(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        await fetchData()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除项目
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除项目 "${row.name}" 吗？此操作不可逆。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteProject(row.id)
      ElMessage.success('删除项目成功')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除项目失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 加载初始数据
onMounted(async () => {
  // 如果是企业管理员或项目经理，确保先加载企业信息
  if ((isCompanyAdmin() || isProjectManager()) && !useCompanyStore().hasCompanyInfo) {
    try {
      await useCompanyStore().fetchCompanyInfo()
    } catch (error) {
      console.error('获取企业信息失败:', error)
      ElMessage.error('获取企业信息失败，请刷新页面重试')
      return
    }
  }
  
  // 如果是系统管理员，先加载企业列表
  if (isAdmin()) {
    await fetchCompanyList()
  } else {
    // 如果是企业管理员，加载该企业的项目经理列表
    if (isCompanyAdmin()) {
      await loadManagerListForCurrentCompany()
    }
  }
  
  // 加载项目列表
  fetchData()
})
</script>

<style scoped>
.projects-container {
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

.list-container {
  margin-bottom: 24px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.project-details {
  padding: 0 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
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
</style> 