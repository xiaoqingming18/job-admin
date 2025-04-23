<template>
  <div class="interviews-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>面试管理</h2>
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
        <el-form-item label="面试状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option
              v-for="(label, value) in InterviewStatusMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="求职者">
          <el-input v-model="searchForm.jobSeekerName" placeholder="求职者姓名" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadInterviews">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 面试日历视图 -->
      <div class="view-switch">
        <span>视图：</span>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="list">列表视图</el-radio-button>
          <el-radio-button label="calendar">日历视图</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'">
        <el-table
          v-loading="loading"
          :data="interviewList"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="求职者" width="120">
            <template #default="{ row }">
              {{ row.jobSeekerName }}
            </template>
          </el-table-column>
          <el-table-column label="劳务需求" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.demandTitle }}
            </template>
          </el-table-column>
          <el-table-column label="面试时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.interviewDate) }}
            </template>
          </el-table-column>
          <el-table-column label="面试地点" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.location }}
            </template>
          </el-table-column>
          <el-table-column label="面试类型" width="120">
            <template #default="{ row }">
              {{ InterviewTypeMap[row.interviewType] }}
            </template>
          </el-table-column>
          <el-table-column label="面试状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getInterviewStatusType(row.status)">
                {{ InterviewStatusMap[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="面试结果" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.status === InterviewStatus.COMPLETED" :type="getInterviewResultType(row.result)">
                {{ InterviewResultMap[row.result] }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="goToApplicationDetail(row.applicationId)">
                查看申请
              </el-button>
              <el-button 
                v-if="row.status === InterviewStatus.SCHEDULED" 
                type="success" 
                size="small" 
                @click="showCompleteInterviewDialog(row)"
              >
                完成面试
              </el-button>
              <el-button 
                v-if="row.status === InterviewStatus.SCHEDULED" 
                type="danger" 
                size="small" 
                @click="cancelInterview(row.id)"
              >
                取消面试
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
      </div>

      <!-- 日历视图 -->
      <div v-else class="calendar-container">
        <p class="text-center" style="font-size: 16px; margin-bottom: 20px;">
          开发中，敬请期待...
        </p>
      </div>
    </el-card>

    <!-- 完成面试对话框 -->
    <el-dialog
      v-model="completeInterviewDialogVisible"
      title="完成面试"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="completeInterviewFormRef"
        :model="completeInterviewForm"
        :rules="completeInterviewRules"
        label-width="100px"
      >
        <el-form-item label="面试结果" prop="result">
          <el-select v-model="completeInterviewForm.result" placeholder="请选择面试结果" style="width: 100%">
            <el-option
              v-for="(label, value) in InterviewResultMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="结果说明" prop="resultComment">
          <el-input
            v-model="completeInterviewForm.resultComment"
            type="textarea"
            placeholder="请输入结果说明"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="completeInterviewDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitCompleteInterview">
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
import { 
  InterviewType, 
  InterviewTypeMap, 
  InterviewStatus, 
  InterviewStatusMap,
  InterviewResult,
  InterviewResultMap
} from '@/types/jobApplication'

const router = useRouter()

// 项目列表
const projects = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  projectId: undefined as number | undefined,
  status: undefined as string | undefined,
  jobSeekerName: undefined as string | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 视图模式：list（列表）或 calendar（日历）
const viewMode = ref('list')

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 面试列表数据
const interviewList = ref<any[]>([])

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 完成面试表单
const completeInterviewFormRef = ref()
const completeInterviewDialogVisible = ref(false)
const completeInterviewForm = reactive({
  interviewId: 0,
  status: InterviewStatus.COMPLETED,
  result: InterviewResult.PENDING,
  resultComment: ''
})

// 完成面试校验规则
const completeInterviewRules = {
  result: [
    { required: true, message: '请选择面试结果', trigger: 'change' }
  ]
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取面试状态标签类型
const getInterviewStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [InterviewStatus.SCHEDULED]: 'primary',
    [InterviewStatus.COMPLETED]: 'success',
    [InterviewStatus.CANCELLED]: 'danger',
    [InterviewStatus.RESCHEDULED]: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取面试结果标签类型
const getInterviewResultType = (result: string) => {
  const typeMap: Record<string, string> = {
    [InterviewResult.PENDING]: 'info',
    [InterviewResult.PASS]: 'success',
    [InterviewResult.FAIL]: 'danger'
  }
  return typeMap[result] || 'info'
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

// 加载面试列表
const loadInterviews = async () => {
  loading.value = true
  
  // 如果设置了日期范围，更新搜索条件
  if (dateRange.value) {
    searchForm.startDate = dateRange.value[0]
    searchForm.endDate = dateRange.value[1]
  } else {
    searchForm.startDate = undefined
    searchForm.endDate = undefined
  }

  try {
    // 准备请求参数
    const params = {
      pageNum: pagination.page,
      pageSize: pagination.size,
      projectId: searchForm.projectId,
      status: searchForm.status,
      jobSeekerName: searchForm.jobSeekerName,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    }
    
    // 获取token
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 发送请求
    const response = await fetch('/api/interview/list', {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    })
    
    // 解析JSON响应
    const jsonData = await response.json()
    console.log('面试列表数据:', jsonData)
    
    if (jsonData.code === 0) {
      const responseData = jsonData.data
      interviewList.value = responseData.list || []
      pagination.total = responseData.total || 0
    } else {
      ElMessage.error(jsonData.message || '获取面试列表失败')
    }
  } catch (error: any) {
    console.error('请求错误:', error)
    ElMessage.error(error.message || '获取面试列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.projectId = undefined
  searchForm.status = undefined
  searchForm.jobSeekerName = undefined
  dateRange.value = null
  searchForm.startDate = undefined
  searchForm.endDate = undefined
  pagination.page = 1
  loadInterviews()
}

// 跳转到申请详情
const goToApplicationDetail = (applicationId: number) => {
  router.push(`/dashboard/job-applications/${applicationId}`)
}

// 显示完成面试对话框
const showCompleteInterviewDialog = (interview: any) => {
  completeInterviewForm.interviewId = interview.id
  completeInterviewForm.status = InterviewStatus.COMPLETED
  completeInterviewForm.result = InterviewResult.PENDING
  completeInterviewForm.resultComment = ''
  completeInterviewDialogVisible.value = true
}

// 提交完成面试
const submitCompleteInterview = async () => {
  if (!completeInterviewFormRef.value) return
  
  await completeInterviewFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const res = await jobApplicationApi.updateInterview(completeInterviewForm)
      // API接口已在拦截器中处理过错误，这里直接显示成功消息
      ElMessage.success('面试状态更新成功')
      completeInterviewDialogVisible.value = false
      // 重新加载面试列表
      loadInterviews()
    } catch (error: any) {
      ElMessage.error(error.message || '面试状态更新失败')
    } finally {
      submitting.value = false
    }
  })
}

// 取消面试
const cancelInterview = async (interviewId: number) => {
  try {
    await ElMessageBox.confirm('确定要取消此面试吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    submitting.value = true
    const params = {
      interviewId,
      status: InterviewStatus.CANCELLED
    }
    
    const res = await jobApplicationApi.updateInterview(params)
    // API接口已在拦截器中处理过错误，这里直接显示成功消息
    ElMessage.success('面试已取消')
    // 重新加载面试列表
    loadInterviews()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消面试失败')
    }
  } finally {
    submitting.value = false
  }
}

// 分页大小变化
const onSizeChange = (size: number) => {
  pagination.page = 1
  pagination.size = size
  loadInterviews()
}

// 页码变化
const onPageChange = (page: number) => {
  pagination.page = page
  loadInterviews()
}

// 初始化
onMounted(() => {
  loadProjects()
  loadInterviews()
})
</script>

<style scoped>
.interviews-container {
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

.view-switch {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.calendar-container {
  min-height: 400px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-center {
  text-align: center;
}
</style> 