<template>
  <div class="application-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="title-container">
            <el-button @click="goBack" icon="ArrowLeft" />
            <h2>求职申请详情</h2>
          </div>
          <div class="action-container">
            <el-button 
              v-if="canArrangeInterview" 
              type="success" 
              @click="showArrangeInterviewDialog"
            >
              安排面试
            </el-button>
            <el-button 
              v-if="canHire" 
              type="primary" 
              @click="handleStatusChange(ApplicationStatus.HIRED)"
            >
              录用
            </el-button>
            <el-button 
              v-if="canReject" 
              type="danger" 
              @click="showRejectDialog"
            >
              拒绝
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="applicationDetail">
        <!-- 基本信息 -->
        <el-descriptions title="申请基本信息" :column="2" border>
          <el-descriptions-item label="申请状态">
            <el-tag :type="getStatusType(applicationDetail.status)">
              {{ ApplicationStatusMap[applicationDetail.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDateTime(applicationDetail.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="需求标题">
            {{ applicationDetail.demandTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="项目名称">
            {{ applicationDetail.projectName }}
          </el-descriptions-item>
          <el-descriptions-item label="期望入职时间">
            {{ formatDate(applicationDetail.expectedEntryDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="期望薪资">
            {{ applicationDetail.expectedSalary ? `¥${applicationDetail.expectedSalary}/天` : '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="自我介绍" :span="2">
            {{ applicationDetail.selfIntroduction || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="applicationDetail.status === ApplicationStatus.REJECTED" label="拒绝原因" :span="2">
            {{ applicationDetail.rejectionReason }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 求职者信息 -->
        <el-descriptions title="求职者信息" :column="2" border class="info-section">
          <el-descriptions-item label="姓名">
            {{ applicationDetail.jobSeekerName }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ applicationDetail.jobSeekerGender === 'male' ? '男' : '女' }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ applicationDetail.jobSeekerAge }}岁
          </el-descriptions-item>
          <el-descriptions-item label="工作年限">
            {{ applicationDetail.jobSeekerWorkYears }}年
          </el-descriptions-item>
          <el-descriptions-item label="技能描述" :span="2">
            {{ applicationDetail.jobSeekerSkill || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="持有证书" :span="2">
            <el-tag 
              v-for="(cert, index) in applicationDetail.jobSeekerCertificates" 
              :key="index"
              style="margin-right: 5px"
            >
              {{ cert }}
            </el-tag>
            <span v-if="!applicationDetail.jobSeekerCertificates || applicationDetail.jobSeekerCertificates.length === 0">
              无
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="applicationDetail.resumeUrl" label="简历" :span="2">
            <el-button type="primary" link @click="viewResume">查看简历</el-button>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 面试信息 -->
        <div v-if="applicationDetail.interviews && applicationDetail.interviews.length > 0" class="info-section">
          <h3>面试记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="interview in applicationDetail.interviews"
              :key="interview.id"
              :color="getInterviewStatusColor(interview.status)"
              :timestamp="formatDateTime(interview.interviewDate)"
            >
              <el-card>
                <template #header>
                  <div class="interview-header">
                    <span>{{ InterviewTypeMap[interview.interviewType] }}</span>
                    <el-tag :type="getInterviewStatusType(interview.status)">
                      {{ InterviewStatusMap[interview.status] }}
                    </el-tag>
                    <el-tag v-if="interview.status === InterviewStatus.COMPLETED" :type="getInterviewResultType(interview.result)">
                      {{ InterviewResultMap[interview.result] }}
                    </el-tag>
                  </div>
                </template>
                <p><strong>面试地点：</strong>{{ interview.location }}</p>
                <p v-if="interview.remarks"><strong>备注：</strong>{{ interview.remarks }}</p>
                <p v-if="interview.resultComment"><strong>结果说明：</strong>{{ interview.resultComment }}</p>
                
                <div class="interview-actions" v-if="interview.status === InterviewStatus.SCHEDULED">
                  <el-button type="primary" size="small" @click="showCompleteInterviewDialog(interview)">
                    完成面试
                  </el-button>
                  <el-button type="danger" size="small" @click="cancelInterview(interview.id)">
                    取消面试
                  </el-button>
                </div>
                
                <div v-if="interview.status === InterviewStatus.COMPLETED && !hasReviewed(interview.id)" class="mt-2">
                  <el-button type="primary" size="small" @click="showReviewDialog(interview.id)">
                    添加评价
                  </el-button>
                </div>
                
                <div v-if="hasReviews(interview.id)">
                  <el-divider>面试评价</el-divider>
                  <div v-if="interviewReviews[interview.id]">
                    <div 
                      v-for="review in interviewReviews[interview.id]" 
                      :key="review.id"
                      class="review-item"
                    >
                      <div class="review-header">
                        <span>{{ review.reviewerName }}</span>
                        <span class="reviewer-type">{{ review.reviewerType === 'project_manager' ? '项目经理' : '求职者' }}</span>
                        <el-rate 
                          v-model="review.rating" 
                          disabled 
                          text-color="#ff9900"
                        />
                      </div>
                      <p>{{ review.comment }}</p>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
        
        <div v-else class="empty-interviews">
          <el-empty description="暂无面试记录" />
        </div>
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

    <!-- 拒绝申请对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="rejectFormRef"
        :model="rejectForm"
        :rules="rejectRules"
        label-width="100px"
      >
        <el-form-item label="拒绝原因" prop="rejectionReason">
          <el-input
            v-model="rejectForm.rejectionReason"
            type="textarea"
            placeholder="请输入拒绝原因"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取 消</el-button>
          <el-button type="danger" :loading="submitting" @click="submitReject">
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 面试评价对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="面试评价"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewRules"
        label-width="100px"
      >
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="reviewForm.rating" show-score />
        </el-form-item>
        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            placeholder="请输入评价内容"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitReview">
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { 
  jobApplicationApi
} from '@/api/jobApplication'
import type { JobApplicationDetail, Interview, InterviewReview } from '@/types/jobApplication'
import { 
  ApplicationStatus, 
  ApplicationStatusMap, 
  InterviewType, 
  InterviewTypeMap, 
  InterviewStatus, 
  InterviewStatusMap,
  InterviewResult,
  InterviewResultMap
} from '@/types/jobApplication'

const route = useRoute()
const router = useRouter()

// 申请ID
const applicationId = computed(() => Number(route.params.id))

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 申请详情
const applicationDetail = ref<JobApplicationDetail | null>(null)

// 面试评价
const interviewReviews = reactive<Record<number, InterviewReview[]>>({})

// 判断是否可以安排面试
const canArrangeInterview = computed(() => {
  if (!applicationDetail.value) return false
  return applicationDetail.value.status === ApplicationStatus.APPLIED
})

// 判断是否可以录用
const canHire = computed(() => {
  if (!applicationDetail.value) return false
  return [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEWING].includes(applicationDetail.value.status as any)
})

// 判断是否可以拒绝
const canReject = computed(() => {
  if (!applicationDetail.value) return false
  return [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEWING].includes(applicationDetail.value.status as any)
})

// 安排面试表单
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

// 拒绝申请表单
const rejectFormRef = ref()
const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  id: 0,
  status: ApplicationStatus.REJECTED,
  rejectionReason: ''
})

// 拒绝申请校验规则
const rejectRules = {
  rejectionReason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' }
  ]
}

// 面试评价表单
const reviewFormRef = ref()
const reviewDialogVisible = ref(false)
const reviewForm = reactive({
  interviewId: 0,
  rating: 5,
  comment: ''
})

// 评价校验规则
const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' }
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

// 获取面试状态颜色
const getInterviewStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    [InterviewStatus.SCHEDULED]: '#409EFF',
    [InterviewStatus.COMPLETED]: '#67C23A',
    [InterviewStatus.CANCELLED]: '#F56C6C',
    [InterviewStatus.RESCHEDULED]: '#E6A23C'
  }
  return colorMap[status] || '#909399'
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

// 判断是否已有评价
const hasReviewed = (interviewId: number) => {
  if (!interviewReviews[interviewId]) return false
  return interviewReviews[interviewId].some(review => review.reviewerType === 'project_manager')
}

// 判断是否有评价列表
const hasReviews = (interviewId: number) => {
  return interviewReviews[interviewId] && interviewReviews[interviewId].length > 0
}

// 加载申请详情
const loadApplicationDetail = async () => {
  if (!applicationId.value) return
  
  loading.value = true
  try {
    // 使用原生fetch API
    // 获取token
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`/api/job-application/detail/${applicationId.value}`, {
      method: 'GET',
      headers
    })
    
    // 解析JSON响应
    const jsonData = await response.json()
    console.log('API返回的详情数据:', jsonData)
    
    if (jsonData.code === 0) {
      applicationDetail.value = jsonData.data
      console.log('申请详情数据:', applicationDetail.value)
      
      // 如果有面试，加载面试评价
      if (applicationDetail.value.interviews && applicationDetail.value.interviews.length > 0) {
        await Promise.all(applicationDetail.value.interviews.map(interview => loadInterviewReviews(interview.id)))
      }
    } else {
      ElMessage.error(jsonData.message || '获取申请详情失败')
    }
  } catch (error: any) {
    console.error('获取申请详情错误:', error)
    ElMessage.error(error.message || '获取申请详情失败')
  } finally {
    loading.value = false
  }
}

// 加载面试评价
const loadInterviewReviews = async (interviewId: number) => {
  try {
    // 使用原生fetch API
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`/api/job-application/interview-reviews/${interviewId}`, {
      method: 'GET',
      headers
    })
    
    // 解析JSON响应
    const jsonData = await response.json()
    console.log(`面试${interviewId}评价数据:`, jsonData)
    
    if (jsonData.code === 0) {
      interviewReviews[interviewId] = jsonData.data
    }
  } catch (error) {
    console.error('获取面试评价失败', error)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 查看简历
const viewResume = () => {
  if (!applicationDetail.value?.resumeUrl) return
  window.open(applicationDetail.value.resumeUrl, '_blank')
}

// 显示安排面试对话框
const showArrangeInterviewDialog = () => {
  interviewForm.applicationId = applicationId.value
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
      // 使用原生fetch API
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/job-application/arrange-interview', {
        method: 'POST',
        headers,
        body: JSON.stringify(interviewForm)
      })
      
      // 解析JSON响应
      const jsonData = await response.json()
      console.log('安排面试响应:', jsonData)
      
      if (jsonData.code === 0) {
        ElMessage.success('面试安排成功')
        interviewDialogVisible.value = false
        loadApplicationDetail()
      } else {
        ElMessage.error(jsonData.message || '面试安排失败')
      }
    } catch (error: any) {
      console.error('安排面试错误:', error)
      ElMessage.error(error.message || '面试安排失败')
    } finally {
      submitting.value = false
    }
  })
}

// 显示完成面试对话框
const showCompleteInterviewDialog = (interview: Interview) => {
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
      // 使用原生fetch API
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/job-application/update-interview', {
        method: 'PUT',
        headers,
        body: JSON.stringify(completeInterviewForm)
      })
      
      // 解析JSON响应
      const jsonData = await response.json()
      console.log('完成面试响应:', jsonData)
      
      if (jsonData.code === 0) {
        ElMessage.success('面试状态更新成功')
        completeInterviewDialogVisible.value = false
        loadApplicationDetail()
      } else {
        ElMessage.error(jsonData.message || '面试状态更新失败')
      }
    } catch (error: any) {
      console.error('完成面试错误:', error)
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
    
    // 使用原生fetch API
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch('/api/job-application/update-interview', {
      method: 'PUT',
      headers,
      body: JSON.stringify(params)
    })
    
    // 解析JSON响应
    const jsonData = await response.json()
    console.log('取消面试响应:', jsonData)
    
    if (jsonData.code === 0) {
      ElMessage.success('面试已取消')
      loadApplicationDetail()
    } else {
      ElMessage.error(jsonData.message || '取消面试失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消面试错误:', error)
      ElMessage.error(error.message || '取消面试失败')
    }
  } finally {
    submitting.value = false
  }
}

// 显示拒绝对话框
const showRejectDialog = () => {
  rejectForm.id = applicationId.value
  rejectForm.status = ApplicationStatus.REJECTED
  rejectForm.rejectionReason = ''
  rejectDialogVisible.value = true
}

// 提交拒绝
const submitReject = async () => {
  if (!rejectFormRef.value) return
  
  await rejectFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 使用原生fetch API
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/job-application/update-status', {
        method: 'PUT',
        headers,
        body: JSON.stringify(rejectForm)
      })
      
      // 解析JSON响应
      const jsonData = await response.json()
      console.log('拒绝申请响应:', jsonData)
      
      if (jsonData.code === 0) {
        ElMessage.success('已拒绝该申请')
        rejectDialogVisible.value = false
        loadApplicationDetail()
      } else {
        ElMessage.error(jsonData.message || '拒绝申请失败')
      }
    } catch (error: any) {
      console.error('拒绝申请错误:', error)
      ElMessage.error(error.message || '拒绝申请失败')
    } finally {
      submitting.value = false
    }
  })
}

// 更新申请状态
const handleStatusChange = async (status: string) => {
  try {
    let confirmMessage = '确定要更新申请状态吗？'
    if (status === ApplicationStatus.HIRED) {
      confirmMessage = '确定要录用该求职者吗？'
    }
    
    await ElMessageBox.confirm(confirmMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    submitting.value = true
    const params = {
      id: applicationId.value,
      status
    }
    
    // 使用原生fetch API
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch('/api/job-application/update-status', {
      method: 'PUT',
      headers,
      body: JSON.stringify(params)
    })
    
    // 解析JSON响应
    const jsonData = await response.json()
    console.log('状态更新响应:', jsonData)
    
    if (jsonData.code === 0) {
      ElMessage.success('状态更新成功')
      loadApplicationDetail()
    } else {
      ElMessage.error(jsonData.message || '状态更新失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('状态更新错误:', error)
      ElMessage.error(error.message || '状态更新失败')
    }
  } finally {
    submitting.value = false
  }
}

// 显示评价对话框
const showReviewDialog = (interviewId: number) => {
  reviewForm.interviewId = interviewId
  reviewForm.rating = 5
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

// 提交评价
const submitReview = async () => {
  if (!reviewFormRef.value) return
  
  await reviewFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 使用原生fetch API
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/job-application/manager-review', {
        method: 'POST',
        headers,
        body: JSON.stringify(reviewForm)
      })
      
      // 解析JSON响应
      const jsonData = await response.json()
      console.log('提交评价响应:', jsonData)
      
      if (jsonData.code === 0) {
        ElMessage.success('评价提交成功')
        reviewDialogVisible.value = false
        await loadInterviewReviews(reviewForm.interviewId)
      } else {
        ElMessage.error(jsonData.message || '评价提交失败')
      }
    } catch (error: any) {
      console.error('提交评价错误:', error)
      ElMessage.error(error.message || '评价提交失败')
    } finally {
      submitting.value = false
    }
  })
}

// 初始化
onMounted(() => {
  loadApplicationDetail()
})
</script>

<style scoped>
.application-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-section {
  margin-top: 20px;
}

.interview-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.interview-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.review-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.reviewer-type {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.empty-interviews {
  margin-top: 20px;
  padding: 40px 0;
}
</style> 