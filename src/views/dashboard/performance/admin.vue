<template>
  <div class="performance-admin-container">
    <!-- 查询条件卡片 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>项目成员绩效评估管理</span>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="企业">
          <el-select v-model="selectedCompanyId" placeholder="选择企业" clearable filterable @change="handleCompanyChange">
            <el-option
              v-for="item in companies"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="项目">
          <el-select v-model="queryParams.projectId" placeholder="选择项目" clearable filterable @change="handleProjectChange">
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="成员">
          <el-select v-model="queryParams.memberId" placeholder="选择成员" clearable filterable>
            <el-option
              v-for="item in projectMembers"
              :key="item.id"
              :label="item.realName || item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="评估周期">
          <el-date-picker
            v-model="evaluationPeriodDate"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            clearable
            @change="handlePeriodChange"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 绩效评估记录表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>绩效评估记录</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="performanceList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="memberName" label="成员姓名" width="100" />
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column prop="occupationName" label="工种" width="100" />
        <el-table-column prop="evaluationPeriod" label="评估周期" width="100" />
        <el-table-column prop="totalScore" label="总评分" width="80">
          <template #default="scope">
            <el-tag :type="getScoreTagType(scope.row.totalScore)">
              {{ scope.row.totalScore }} 分
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="各项评分" width="200">
          <template #default="scope">
            <div class="score-detail">
              <div class="score-item">
                <span>质量：</span>
                <span>{{ scope.row.workQualityScore }}</span>
              </div>
              <div class="score-item">
                <span>效率：</span>
                <span>{{ scope.row.efficiencyScore }}</span>
              </div>
              <div class="score-item">
                <span>态度：</span>
                <span>{{ scope.row.attitudeScore }}</span>
              </div>
              <div class="score-item">
                <span>协作：</span>
                <span>{{ scope.row.teamworkScore }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="evaluatorName" label="评估人" width="100" />
        <el-table-column prop="createTime" label="评估时间" width="150" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { MemberPerformance, PerformanceQueryParams } from '@/types/performance'
import { getPerformancePage } from '@/api/performance'
import { getCompanyList } from '@/api/company'
import { getProjectList } from '@/api/project'
import { getProjectMemberList } from '@/api/projectMember'
import type { Company } from '@/types/company'
import type { Project } from '@/types/project'
import type { ProjectMember } from '@/types/projectMember'

const router = useRouter()

// 查询参数
const queryParams = reactive<PerformanceQueryParams>({
  pageNum: 1,
  pageSize: 10
})

// 日期选择器相关
const evaluationPeriodDate = ref<string | null>(null)

// 数据加载状态
const loading = ref(false)
// 绩效评估记录列表
const performanceList = ref<MemberPerformance[]>([])
// 总记录数
const total = ref(0)

// 企业列表
const companies = ref<Company[]>([])
const selectedCompanyId = ref<number | null>(null)

// 项目列表
const projects = ref<Project[]>([])
// 项目成员列表
const projectMembers = ref<ProjectMember[]>([])

// 加载企业列表
const loadCompanies = async () => {
  try {
    const res = await getCompanyList()
    companies.value = res.data || []
  } catch (error) {
    console.error('Failed to load companies:', error)
    ElMessage.error('加载企业列表失败')
  }
}

// 企业变更处理
const handleCompanyChange = async (companyId: number | null) => {
  queryParams.projectId = undefined
  queryParams.memberId = undefined
  projects.value = []
  projectMembers.value = []
  
  if (companyId) {
    try {
      const res = await getProjectList({ companyId })
      projects.value = res.data.list || []
    } catch (error) {
      console.error('Failed to load projects:', error)
      ElMessage.error('加载项目列表失败')
    }
  }
}

// 项目变更处理
const handleProjectChange = async (projectId: number | null) => {
  queryParams.memberId = undefined
  projectMembers.value = []
  
  if (projectId) {
    try {
      const res = await getProjectMemberList(projectId)
      projectMembers.value = res.data || []
    } catch (error) {
      console.error('Failed to load project members:', error)
      ElMessage.error('加载项目成员失败')
    }
  }
}

// 获取绩效评估记录
const getPerformanceRecords = async () => {
  loading.value = true
  try {
    const res = await getPerformancePage(queryParams)
    performanceList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('Failed to load performance records:', error)
    ElMessage.error('加载绩效评估记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  queryParams.pageNum = 1
  getPerformanceRecords()
}

// 重置查询
const resetQuery = () => {
  selectedCompanyId.value = null
  Object.assign(queryParams, {
    projectId: undefined,
    memberId: undefined,
    evaluationPeriod: undefined,
    pageNum: 1,
    pageSize: 10
  })
  evaluationPeriodDate.value = null
  projects.value = []
  projectMembers.value = []
  getPerformanceRecords()
}

// 查看绩效评估详情
const handleView = (row: MemberPerformance) => {
  router.push({
    name: 'performance-detail',
    params: { id: row.id }
  })
}

// 分页大小变更
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getPerformanceRecords()
}

// 当前页变更
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getPerformanceRecords()
}

// 获取得分标签类型
const getScoreTagType = (score: number): '' | 'info' | 'success' | 'warning' | 'danger' => {
  if (score >= 9) return 'success'
  if (score >= 7) return 'info'
  if (score >= 5) return 'warning'
  return 'danger'
}

// 评估周期变更处理
const handlePeriodChange = (value: string | null) => {
  queryParams.evaluationPeriod = value || undefined
}

// 初始化
onMounted(() => {
  loadCompanies()
  getPerformanceRecords()
})
</script>

<style scoped>
.performance-admin-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-card,
.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.score-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.score-item {
  display: flex;
  justify-content: space-between;
}
</style> 