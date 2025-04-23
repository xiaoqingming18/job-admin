<template>
  <div class="job-applications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>求职申请管理</h2>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="项目">
          <el-select v-model="searchForm.projectId" placeholder="选择项目" clearable>
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option
              v-for="(label, value) in ApplicationStatusMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="求职者">
          <el-input v-model="searchForm.jobSeekerName" placeholder="求职者姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadApplications">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 申请列表表格 -->
      <el-table
        v-loading="loading"
        :data="applicationList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="jobSeekerName" label="求职者" width="120" />
        <el-table-column prop="demandTitle" label="需求标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="期望入职时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expectedEntryDate) }}
          </template>
        </el-table-column>
        <el-table-column label="期望薪资" width="120">
          <template #default="{ row }">
            {{ row.expectedSalary ? `¥${row.expectedSalary}/天` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="申请状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ ApplicationStatusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(row.id)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status === ApplicationStatus.APPLIED"
              type="success"
              size="small"
              @click="showArrangeInterviewDialog(row)"
            >
              安排面试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <!-- 安排面试对话框 -->
    <el-dialog
      v-model="interviewDialogVisible"
      title="安排面试"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="interviewFormRef"
        :model="interviewForm"
        :rules="interviewRules"
        label-width="100px"
      >
        <el-form-item label="面试日期" prop="interviewDate">
          <el-date-picker
            v-model="interviewForm.interviewDate"
            type="datetime"
            placeholder="选择面试日期时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabledDate="disabledDate"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="面试地点" prop="location">
          <el-input v-model="interviewForm.location" placeholder="请输入面试地点" />
        </el-form-item>
        <el-form-item label="面试类型" prop="interviewType">
          <el-select v-model="interviewForm.interviewType" placeholder="请选择面试类型" style="width: 100%">
            <el-option
              v-for="(label, value) in InterviewTypeMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="interviewForm.remarks"
            type="textarea"
            placeholder="请输入备注信息，例如需要带的资料等"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="interviewDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitInterview">
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { jobApplicationApi } from '@/api/jobApplication'
import { getManagerProjectList } from '@/api/project'
import type { JobApplication } from '@/types/jobApplication'
import { ApplicationStatus, ApplicationStatusMap, InterviewTypeMap } from '@/types/jobApplication'

const router = useRouter()

// 项目列表
const projects = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  projectId: undefined as number | undefined,
  status: undefined as string | undefined,
  jobSeekerName: undefined as string | undefined
})

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 申请列表
const applicationList = ref<JobApplication[]>([])

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 面试表单
const interviewFormRef = ref()
const interviewDialogVisible = ref(false)
const interviewForm = reactive({
  applicationId: 0,
  interviewDate: '',
  location: '',
  interviewType: 'onsite',
  remarks: ''
})

// 校验规则
const interviewRules = {
  interviewDate: [
    { required: true, message: '请选择面试日期时间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入面试地点', trigger: 'blur' }
  ],
  interviewType: [
    { required: true, message: '请选择面试类型', trigger: 'change' }
  ]
}

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${formatDate(dateStr)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [ApplicationStatus.APPLIED]: 'info',
    [ApplicationStatus.INTERVIEWING]: 'warning',
    [ApplicationStatus.REJECTED]: 'danger',
    [ApplicationStatus.HIRED]: 'success',
    [ApplicationStatus.CANCELLED]: 'info'
  }
  return typeMap[status] || 'info'
}

// 加载项目列表
const loadProjects = async () => {
  try {
    // 从localStorage获取当前登录用户ID
    const userId = localStorage.getItem('userId')
    if (!userId) {
      return
    }
    
    const res = await getManagerProjectList(Number(userId))
    if (res.data && res.data.code === 0) {
      projects.value = res.data.data
    }
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

// 加载申请列表
const loadApplications = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    
    // 直接使用原生fetch API发送请求
    // 获取token
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch('/api/job-application/list', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pageNum: params.page,
        pageSize: params.size,
        projectId: params.projectId,
        status: params.status,
        jobSeekerName: params.jobSeekerName
      })
    })
    
    // 解析JSON响应
    const jsonData = await response.json()
    console.log('Fetch API返回的原始数据:', jsonData)
    
    if (jsonData.code === 0) {
      const responseData = jsonData.data
      console.log('业务数据:', responseData)
      
      // 根据实际返回结构设置数据
      if (responseData.list) {
        applicationList.value = responseData.list
        pagination.total = responseData.total || 0
      } else {
        console.error('无法识别的数据结构:', responseData)
        ElMessage.error('获取申请列表失败: 数据结构不匹配')
      }
    } else {
      ElMessage.error(jsonData.message || '获取申请列表失败')
    }
  } catch (error: any) {
    console.error('请求错误:', error)
    ElMessage.error(error.message || '获取申请列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.projectId = undefined
  searchForm.status = undefined
  searchForm.jobSeekerName = undefined
  pagination.page = 1
  loadApplications()
}

// 查看详情
const viewDetail = (id: number) => {
  router.push(`/dashboard/job-applications/${id}`)
}

// 显示安排面试对话框
const showArrangeInterviewDialog = (application: JobApplication) => {
  interviewForm.applicationId = application.id
  interviewForm.interviewDate = ''
  interviewForm.location = ''
  interviewForm.interviewType = 'onsite'
  interviewForm.remarks = ''
  interviewDialogVisible.value = true
}

// 提交面试安排
const submitInterview = async () => {
  if (!interviewFormRef.value) return
  
  await interviewFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const res = await jobApplicationApi.arrangeInterview(interviewForm)
      // res already contains the response data returned by the axios interceptor
      // The interceptor in request.ts already checks for code === 0
      ElMessage.success('面试安排成功')
      interviewDialogVisible.value = false
      loadApplications()
    } catch (error: any) {
      ElMessage.error(error.message || '面试安排失败')
    } finally {
      submitting.value = false
    }
  })
}

// 分页大小变化
const onSizeChange = (size: number) => {
  pagination.page = 1
  pagination.size = size
  loadApplications()
}

// 页码变化
const onPageChange = (page: number) => {
  pagination.page = page
  loadApplications()
}

// 初始化
onMounted(() => {
  loadProjects()
  loadApplications()
})
</script>

<style scoped>
.job-applications-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 