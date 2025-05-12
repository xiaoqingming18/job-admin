<template>
  <div class="performance-manager-container">
    <!-- 查询条件卡片 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>项目成员绩效评估管理</span>
          <div>
            <el-button type="primary" @click="handleAdd">添加评估</el-button>
          </div>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryParams" inline>
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
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="scope.row.evaluatorId === userStore.user?.id"
              size="small" 
              link 
              type="primary" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="scope.row.evaluatorId === userStore.user?.id"
              size="small" 
              link 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
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
    
    <!-- 添加/编辑绩效评估弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加绩效评估' : '编辑绩效评估'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="performanceFormRef"
        :model="performanceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item v-if="dialogType === 'add'" label="项目" prop="projectId">
          <el-select v-model="performanceForm.projectId" placeholder="选择项目" filterable @change="handleFormProjectChange">
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'add'" label="成员" prop="memberId">
          <el-select v-model="performanceForm.memberId" placeholder="选择成员" filterable>
            <el-option
              v-for="item in dialogProjectMembers"
              :key="item.id"
              :label="item.realName || item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'add'" label="评估周期" prop="evaluationPeriod">
          <el-date-picker
            v-model="dialogEvaluationPeriodDate"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            @change="handleDialogPeriodChange"
          />
        </el-form-item>
        
        <el-form-item label="工作质量" prop="workQualityScore">
          <el-rate
            v-model="qualityRate"
            :max="10"
            show-score
            @change="handleQualityRateChange"
          />
        </el-form-item>
        
        <el-form-item label="工作效率" prop="efficiencyScore">
          <el-rate
            v-model="efficiencyRate"
            :max="10"
            show-score
            @change="handleEfficiencyRateChange"
          />
        </el-form-item>
        
        <el-form-item label="工作态度" prop="attitudeScore">
          <el-rate
            v-model="attitudeRate"
            :max="10"
            show-score
            @change="handleAttitudeRateChange"
          />
        </el-form-item>
        
        <el-form-item label="团队协作" prop="teamworkScore">
          <el-rate
            v-model="teamworkRate"
            :max="10"
            show-score
            @change="handleTeamworkRateChange"
          />
        </el-form-item>
        
        <el-form-item label="优点" prop="strengths">
          <el-input
            v-model="performanceForm.strengths"
            type="textarea"
            rows="3"
            placeholder="请输入员工的优点和长处"
          />
        </el-form-item>
        
        <el-form-item label="需改进项" prop="weaknesses">
          <el-input
            v-model="performanceForm.weaknesses"
            type="textarea"
            rows="3"
            placeholder="请输入员工需要改进的地方"
          />
        </el-form-item>
        
        <el-form-item label="评语" prop="comments">
          <el-input
            v-model="performanceForm.comments"
            type="textarea"
            rows="3"
            placeholder="请输入综合评语"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { MemberPerformance, PerformanceQueryParams, PerformanceAddParams, PerformanceUpdateParams } from '@/types/performance'
import { getPerformancePage, addPerformance, updatePerformance, deletePerformance, checkPerformancePermission } from '@/api/performance'
import { getManagerProjectList } from '@/api/project'
import { getProjectMemberList } from '@/api/projectMember'
import type { Project } from '@/types/project'
import type { ProjectMember } from '@/types/projectMember'

const router = useRouter()
const userStore = useUserStore()

// 查询参数
const queryParams = reactive<PerformanceQueryParams>({
  pageNum: 1,
  pageSize: 10
})

// 日期选择器相关
const evaluationPeriodDate = ref<string | null>(null)
const dialogEvaluationPeriodDate = ref<string | null>(null)

// 数据加载状态
const loading = ref(false)
// 绩效评估记录列表
const performanceList = ref<MemberPerformance[]>([])
// 总记录数
const total = ref(0)

// 项目列表
const projects = ref<Project[]>([])
// 项目成员列表
const projectMembers = ref<ProjectMember[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const performanceFormRef = ref<FormInstance>()
const submitting = ref(false)
const dialogProjectMembers = ref<ProjectMember[]>([])

// 表单评分
const qualityRate = ref(1)
const efficiencyRate = ref(1)
const attitudeRate = ref(1)
const teamworkRate = ref(1)

// 表单数据
const performanceForm = reactive<PerformanceAddParams & PerformanceUpdateParams>({
  id: 0,
  memberId: 0,
  projectId: 0,
  evaluationPeriod: '',
  workQualityScore: 1,
  efficiencyScore: 1,
  attitudeScore: 1,
  teamworkScore: 1,
  strengths: '',
  weaknesses: '',
  comments: ''
})

// 表单校验规则
const formRules = reactive<FormRules>({
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  memberId: [{ required: true, message: '请选择成员', trigger: 'change' }],
  evaluationPeriod: [
    { required: true, message: '请输入评估周期', trigger: 'blur' },
    { pattern: /^\d{4}-\d{2}$/, message: '格式应为YYYY-MM，如2023-06', trigger: 'blur' }
  ],
  workQualityScore: [{ required: true, message: '请评分', trigger: 'change' }],
  efficiencyScore: [{ required: true, message: '请评分', trigger: 'change' }],
  attitudeScore: [{ required: true, message: '请评分', trigger: 'change' }],
  teamworkScore: [{ required: true, message: '请评分', trigger: 'change' }]
})

// 加载项目经理的项目列表
const loadManagerProjects = async () => {
  try {
    // 获取用户ID，优先使用userStore.userId，作为备选使用userStore.user?.id
    const userId = userStore.userId || userStore.user?.id
    if (!userId) {
      // 如果仍然没有ID，尝试直接获取user对象中的id字段
      const user = userStore.user as any
      if (user && user.id) {
        const res = await getManagerProjectList(user.id)
        projects.value = res.data || []
        return
      }
      ElMessage.error('获取用户信息失败')
      return
    }
    
    const res = await getManagerProjectList(userId)
    projects.value = res.data || []
  } catch (error) {
    console.error('Failed to load manager projects:', error)
    ElMessage.error('加载项目列表失败')
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

// 表单项目变更处理
const handleFormProjectChange = async (projectId: number) => {
  performanceForm.memberId = 0
  dialogProjectMembers.value = []
  
  if (projectId) {
    try {
      const res = await getProjectMemberList(projectId)
      dialogProjectMembers.value = res.data || []
    } catch (error) {
      console.error('Failed to load project members:', error)
      ElMessage.error('加载项目成员失败')
    }
  }
}

// 评分变更处理
const handleQualityRateChange = (value: number) => {
  performanceForm.workQualityScore = value
}

const handleEfficiencyRateChange = (value: number) => {
  performanceForm.efficiencyScore = value
}

const handleAttitudeRateChange = (value: number) => {
  performanceForm.attitudeScore = value
}

const handleTeamworkRateChange = (value: number) => {
  performanceForm.teamworkScore = value
}

// 获取绩效评估记录
const getPerformanceRecords = async () => {
  loading.value = true
  try {
    // 获取用户ID，优先使用userStore.userId，作为备选使用userStore.user?.id
    const userId = userStore.userId || userStore.user?.id
    if (!userId) {
      // 如果仍然没有ID，尝试直接获取user对象中的id字段
      const user = userStore.user as any
      if (user && user.id) {
        const res = await getPerformancePage(queryParams)
        performanceList.value = res.data.list || []
        total.value = res.data.total || 0
        return
      }
      ElMessage.error('获取用户信息失败')
      return
    }
    
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
  Object.assign(queryParams, {
    projectId: undefined,
    memberId: undefined,
    evaluationPeriod: undefined,
    pageNum: 1,
    pageSize: 10
  })
  evaluationPeriodDate.value = null
  projectMembers.value = []
  getPerformanceRecords()
}

// 添加绩效评估
const handleAdd = () => {
  resetForm()
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 编辑绩效评估
const handleEdit = (row: MemberPerformance) => {
  resetForm()
  dialogType.value = 'edit'
  
  performanceForm.id = row.id
  performanceForm.workQualityScore = row.workQualityScore
  performanceForm.efficiencyScore = row.efficiencyScore
  performanceForm.attitudeScore = row.attitudeScore
  performanceForm.teamworkScore = row.teamworkScore
  performanceForm.strengths = row.strengths || ''
  performanceForm.weaknesses = row.weaknesses || ''
  performanceForm.comments = row.comments || ''
  
  qualityRate.value = row.workQualityScore
  efficiencyRate.value = row.efficiencyScore
  attitudeRate.value = row.attitudeScore
  teamworkRate.value = row.teamworkScore
  
  dialogVisible.value = true
}

// 删除绩效评估
const handleDelete = (row: MemberPerformance) => {
  ElMessageBox.confirm('确定要删除该绩效评估记录吗？删除后不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deletePerformance(row.id)
      if (res.data) {
        ElMessage.success('删除成功')
        getPerformanceRecords()
      }
    } catch (error) {
      console.error('Failed to delete performance record:', error)
      ElMessage.error('删除绩效评估记录失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
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

// 重置表单
const resetForm = () => {
  if (performanceFormRef.value) {
    performanceFormRef.value.resetFields()
  }
  
  Object.assign(performanceForm, {
    id: 0,
    memberId: 0,
    projectId: 0,
    evaluationPeriod: '',
    workQualityScore: 1,
    efficiencyScore: 1,
    attitudeScore: 1,
    teamworkScore: 1,
    strengths: '',
    weaknesses: '',
    comments: ''
  })
  
  dialogEvaluationPeriodDate.value = null
  qualityRate.value = 1
  efficiencyRate.value = 1
  attitudeRate.value = 1
  teamworkRate.value = 1
  
  dialogProjectMembers.value = []
}

// 提交表单
const submitForm = async () => {
  if (!performanceFormRef.value) return
  
  await performanceFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    
    try {
      if (dialogType.value === 'add') {
        // 添加绩效评估
        const params: PerformanceAddParams = {
          memberId: performanceForm.memberId,
          projectId: performanceForm.projectId,
          evaluationPeriod: performanceForm.evaluationPeriod,
          workQualityScore: performanceForm.workQualityScore,
          efficiencyScore: performanceForm.efficiencyScore,
          attitudeScore: performanceForm.attitudeScore,
          teamworkScore: performanceForm.teamworkScore,
          strengths: performanceForm.strengths,
          weaknesses: performanceForm.weaknesses,
          comments: performanceForm.comments
        }
        
        const res = await addPerformance(params)
        if (res.data) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          getPerformanceRecords()
        }
      } else {
        // 更新绩效评估
        const params: PerformanceUpdateParams = {
          id: performanceForm.id,
          workQualityScore: performanceForm.workQualityScore,
          efficiencyScore: performanceForm.efficiencyScore,
          attitudeScore: performanceForm.attitudeScore,
          teamworkScore: performanceForm.teamworkScore,
          strengths: performanceForm.strengths,
          weaknesses: performanceForm.weaknesses,
          comments: performanceForm.comments
        }
        
        const res = await updatePerformance(params)
        if (res.data) {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          getPerformanceRecords()
        }
      }
    } catch (error) {
      console.error('Failed to submit performance form:', error)
      ElMessage.error(dialogType.value === 'add' ? '添加绩效评估失败' : '更新绩效评估失败')
    } finally {
      submitting.value = false
    }
  })
}

// 获取得分标签类型
const getScoreTagType = (score: number): '' | 'info' | 'success' | 'warning' | 'danger' => {
  if (score >= 9) return 'success'
  if (score >= 7) return 'info'
  if (score >= 5) return 'warning'
  return 'danger'
}

// 检查绩效评估权限
const checkPermission = async () => {
  // 假设默认选择第一个项目
  const projectId = projects.value.length > 0 ? projects.value[0].id : undefined
  if (projectId) {
    try {
      const res = await checkPerformancePermission(projectId)
      if (!res.data) {
        ElMessage.warning('您没有绩效评估权限')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to check permission:', error)
    }
  }
}

// 评估周期变更处理
const handlePeriodChange = (value: string | null) => {
  queryParams.evaluationPeriod = value || undefined
}

// 弹窗评估周期变更处理
const handleDialogPeriodChange = (value: string | null) => {
  performanceForm.evaluationPeriod = value || ''
}

// 初始化
onMounted(() => {
  loadManagerProjects().then(() => {
    checkPermission()
  })
  getPerformanceRecords()
})
</script>

<style scoped>
.performance-manager-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 