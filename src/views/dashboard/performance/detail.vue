<template>
  <div class="performance-detail-container">
    <el-page-header @back="goBack" title="返回绩效评估列表">
      <template #content>
        <span class="page-title">绩效评估详情</span>
      </template>
    </el-page-header>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" animated>
        <template #template>
          <el-skeleton-item variant="p" style="width: 100%; height: 60px" />
          <div style="display: flex; justify-content: space-between;">
            <el-skeleton-item variant="text" style="margin-right: 16px; width: 30%" />
            <el-skeleton-item variant="text" style="width: 30%" />
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 16px">
            <el-skeleton-item variant="text" style="margin-right: 16px; width: 30%" />
            <el-skeleton-item variant="text" style="width: 30%" />
          </div>
          <el-skeleton-item variant="p" style="width: 100%; height: 60px; margin-top: 16px" />
          <el-skeleton-item variant="p" style="width: 100%; height: 60px; margin-top: 16px" />
          <el-skeleton-item variant="p" style="width: 100%; height: 60px; margin-top: 16px" />
        </template>
      </el-skeleton>
    </div>
    
    <div v-else-if="performanceDetail">
      <!-- 基本信息卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <div v-if="canEdit">
              <el-button 
                type="primary" 
                size="small"
                @click="handleEdit"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                @click="handleDelete"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="info-container">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">成员姓名:</span>
              <span class="info-value">{{ performanceDetail.memberName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属项目:</span>
              <span class="info-value">{{ performanceDetail.projectName }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">职位:</span>
              <span class="info-value">{{ performanceDetail.position || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">工种:</span>
              <span class="info-value">{{ performanceDetail.occupationName || '未知' }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">评估周期:</span>
              <span class="info-value">{{ performanceDetail.evaluationPeriod }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">评估人:</span>
              <span class="info-value">{{ performanceDetail.evaluatorName }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">创建时间:</span>
              <span class="info-value">{{ performanceDetail.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间:</span>
              <span class="info-value">{{ performanceDetail.updateTime }}</span>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 评分详情卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>评分详情</span>
            <el-tag :type="getScoreTagType(performanceDetail.totalScore)" size="large">
              总分: {{ performanceDetail.totalScore }} 分
            </el-tag>
          </div>
        </template>
        
        <div class="score-container">
          <div class="score-row">
            <div class="score-label">工作质量评分:</div>
            <div class="score-value">
              <el-rate 
                v-model="performanceDetail.workQualityScore" 
                :max="10" 
                disabled 
                show-score 
              />
            </div>
          </div>
          
          <div class="score-row">
            <div class="score-label">工作效率评分:</div>
            <div class="score-value">
              <el-rate 
                v-model="performanceDetail.efficiencyScore" 
                :max="10" 
                disabled 
                show-score 
              />
            </div>
          </div>
          
          <div class="score-row">
            <div class="score-label">工作态度评分:</div>
            <div class="score-value">
              <el-rate 
                v-model="performanceDetail.attitudeScore" 
                :max="10" 
                disabled 
                show-score 
              />
            </div>
          </div>
          
          <div class="score-row">
            <div class="score-label">团队协作评分:</div>
            <div class="score-value">
              <el-rate 
                v-model="performanceDetail.teamworkScore" 
                :max="10" 
                disabled 
                show-score 
              />
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 评语卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>评语与分析</span>
          </div>
        </template>
        
        <div class="feedback-container">
          <div class="feedback-item">
            <div class="feedback-title">优点与长处</div>
            <div class="feedback-content">
              {{ performanceDetail.strengths || '未填写' }}
            </div>
          </div>
          
          <div class="feedback-item">
            <div class="feedback-title">需要改进的地方</div>
            <div class="feedback-content">
              {{ performanceDetail.weaknesses || '未填写' }}
            </div>
          </div>
          
          <div class="feedback-item">
            <div class="feedback-title">总体评语</div>
            <div class="feedback-content">
              {{ performanceDetail.comments || '未填写' }}
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 成员历史评估卡片 -->
      <el-card class="detail-card" v-if="historyList.length > 0">
        <template #header>
          <div class="card-header">
            <span>历史评估记录</span>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in historyList" 
            :key="index"
            :timestamp="item.createTime"
            :type="getTimelineItemType(item.totalScore)"
          >
            <el-card class="timeline-card">
              <div class="timeline-header">
                <span>{{ item.evaluationPeriod }} 评估</span>
                <el-tag :type="getScoreTagType(item.totalScore)">
                  {{ item.totalScore }} 分
                </el-tag>
              </div>
              <div class="timeline-content">
                <div class="score-detail">
                  <div class="score-item">
                    <span>质量：</span>
                    <span>{{ item.workQualityScore }}</span>
                  </div>
                  <div class="score-item">
                    <span>效率：</span>
                    <span>{{ item.efficiencyScore }}</span>
                  </div>
                  <div class="score-item">
                    <span>态度：</span>
                    <span>{{ item.attitudeScore }}</span>
                  </div>
                  <div class="score-item">
                    <span>协作：</span>
                    <span>{{ item.teamworkScore }}</span>
                  </div>
                </div>
                <div class="timeline-comment" v-if="item.comments">
                  {{ item.comments }}
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <div v-else class="empty-container">
      <el-empty description="未找到绩效评估记录" />
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑绩效评估"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="performanceFormRef"
        :model="performanceForm"
        :rules="formRules"
        label-width="100px"
      >
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
          <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { MemberPerformance, PerformanceUpdateParams } from '@/types/performance'
import { getPerformanceInfo, updatePerformance, deletePerformance, getMemberPerformanceList } from '@/api/performance'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 数据加载状态
const loading = ref(true)
// 绩效评估详情
const performanceDetail = ref<MemberPerformance>()
// 历史评估记录
const historyList = ref<MemberPerformance[]>([])

// 编辑表单相关
const dialogVisible = ref(false)
const performanceFormRef = ref<FormInstance>()
const submitting = ref(false)

// 表单评分
const qualityRate = ref(1)
const efficiencyRate = ref(1)
const attitudeRate = ref(1)
const teamworkRate = ref(1)

// 表单数据
const performanceForm = reactive<PerformanceUpdateParams>({
  id: 0,
  workQualityScore: 1,
  efficiencyScore: 1,
  attitudeScore: 1,
  teamworkScore: 1,
  strengths: '',
  weaknesses: '',
  comments: ''
})

// 是否有编辑权限
const canEdit = computed(() => {
  if (!performanceDetail.value || !userStore.user) return false
  return performanceDetail.value.evaluatorId === userStore.user.id
})

// 表单校验规则
const formRules = reactive<FormRules>({
  workQualityScore: [{ required: true, message: '请评分', trigger: 'change' }],
  efficiencyScore: [{ required: true, message: '请评分', trigger: 'change' }],
  attitudeScore: [{ required: true, message: '请评分', trigger: 'change' }],
  teamworkScore: [{ required: true, message: '请评分', trigger: 'change' }]
})

// 获取评估详情
const getPerformance = async () => {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('参数错误')
    router.back()
    return
  }
  
  loading.value = true
  try {
    const res = await getPerformanceInfo(id)
    if (res.data) {
      performanceDetail.value = res.data
      
      // 加载历史记录
      loadHistoryRecords(res.data.memberId, id)
    }
  } catch (error) {
    console.error('Failed to load performance detail:', error)
    ElMessage.error('加载绩效评估详情失败')
  } finally {
    loading.value = false
  }
}

// 加载历史评估记录
const loadHistoryRecords = async (memberId: number, currentId: number) => {
  try {
    const res = await getMemberPerformanceList(memberId)
    if (res.data) {
      // 过滤掉当前记录
      historyList.value = res.data.filter(item => item.id !== currentId)
    }
  } catch (error) {
    console.error('Failed to load history records:', error)
    ElMessage.error('加载历史评估记录失败')
  }
}

// 返回列表
const goBack = () => {
  router.back()
}

// 编辑评估
const handleEdit = () => {
  if (!performanceDetail.value) return
  
  performanceForm.id = performanceDetail.value.id
  performanceForm.workQualityScore = performanceDetail.value.workQualityScore
  performanceForm.efficiencyScore = performanceDetail.value.efficiencyScore
  performanceForm.attitudeScore = performanceDetail.value.attitudeScore
  performanceForm.teamworkScore = performanceDetail.value.teamworkScore
  performanceForm.strengths = performanceDetail.value.strengths || ''
  performanceForm.weaknesses = performanceDetail.value.weaknesses || ''
  performanceForm.comments = performanceDetail.value.comments || ''
  
  qualityRate.value = performanceDetail.value.workQualityScore
  efficiencyRate.value = performanceDetail.value.efficiencyScore
  attitudeRate.value = performanceDetail.value.attitudeScore
  teamworkRate.value = performanceDetail.value.teamworkScore
  
  dialogVisible.value = true
}

// 删除评估
const handleDelete = () => {
  if (!performanceDetail.value) return
  
  ElMessageBox.confirm('确定要删除该绩效评估记录吗？删除后不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deletePerformance(performanceDetail.value!.id)
      if (res.data) {
        ElMessage.success('删除成功')
        router.back()
      }
    } catch (error) {
      console.error('Failed to delete performance record:', error)
      ElMessage.error('删除绩效评估记录失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
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

// 提交表单
const submitForm = async () => {
  if (!performanceFormRef.value) return
  
  await performanceFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    
    try {
      const res = await updatePerformance(performanceForm)
      if (res.data) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        // 刷新数据
        getPerformance()
      }
    } catch (error) {
      console.error('Failed to update performance:', error)
      ElMessage.error('更新绩效评估失败')
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

// 获取时间线项目类型
const getTimelineItemType = (score: number): '' | 'primary' | 'success' | 'warning' | 'danger' => {
  if (score >= 9) return 'success'
  if (score >= 7) return 'primary'
  if (score >= 5) return 'warning'
  return 'danger'
}

// 初始化
onMounted(() => {
  getPerformance()
})
</script>

<style scoped>
.performance-detail-container {
  padding: 20px;
}

.page-title {
  font-weight: bold;
  font-size: 18px;
}

.loading-container {
  margin-top: 20px;
}

.empty-container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.detail-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: flex;
  gap: 40px;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.info-label {
  width: 100px;
  font-weight: bold;
  color: #666;
}

.info-value {
  flex: 1;
}

.score-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.score-row {
  display: flex;
  align-items: center;
}

.score-label {
  width: 120px;
  font-weight: bold;
  color: #666;
}

.score-value {
  flex: 1;
}

.feedback-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feedback-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.feedback-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.feedback-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #666;
}

.feedback-content {
  line-height: 1.6;
  white-space: pre-line;
}

.timeline-card {
  margin-bottom: 10px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.timeline-comment {
  color: #666;
  white-space: pre-line;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 