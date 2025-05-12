<template>
  <div class="salary-detail-container">
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-title">工资单详情</div>
          <div class="header-buttons">
            <el-button @click="goBack">返回</el-button>
            <el-button
              v-if="salaryData.status === 'pending'"
              type="success"
              @click="handleConfirm"
            >确认工资单</el-button>
            <el-button
              v-if="salaryData.status === 'confirmed'"
              type="info"
              @click="handlePay"
            >标记已发放</el-button>
          </div>
        </div>
      </template>
      
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div style="padding: 20px">
            <el-skeleton-item variant="text" style="width: 30%; height: 40px" />
            <div style="display: flex; justify-content: space-between; margin-top: 20px">
              <el-skeleton-item variant="text" style="width: 45%" />
              <el-skeleton-item variant="text" style="width: 45%" />
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 20px">
              <el-skeleton-item variant="text" style="width: 45%" />
              <el-skeleton-item variant="text" style="width: 45%" />
            </div>
            <el-skeleton-item
              variant="p"
              style="width: 100%; height: 200px; margin-top: 20px"
            />
          </div>
        </template>
        
        <div class="salary-info" v-if="salaryData">
          <div class="detail-header">
            <div class="user-info">
              <h2>{{ salaryData.userName }} 的工资单</h2>
              <div class="sub-info">
                <span>工号: {{ salaryData.attendanceCode }}</span>
                <el-tag :type="salaryStatusTypeMap[salaryData.status]" class="status-tag">
                  {{ salaryStatusMap[salaryData.status] }}
                </el-tag>
              </div>
            </div>
            <div class="period-info">
              <h3>{{ salaryData.year }}年{{ salaryData.month }}月</h3>
              <div>项目: {{ salaryData.projectName }}</div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="summary-section">
            <div class="summary-row">
              <div class="summary-label">工作天数</div>
              <div class="summary-value">{{ salaryData.workDays }} 天</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">基本工资</div>
              <div class="summary-value">¥ {{ formatAmount(salaryData.basicSalary) }}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">加班费</div>
              <div class="summary-value">¥ {{ formatAmount(salaryData.overtimePay) }}</div>
            </div>
            <div class="summary-row total-row">
              <div class="summary-label">总金额</div>
              <div class="summary-value total-amount">
                ¥ {{ formatAmount(salaryData.totalAmount) }}
              </div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="detail-section">
            <h3>工资明细</h3>
            <el-table :data="salaryData.items || []" border style="width: 100%">
              <el-table-column label="项目名称" prop="itemName" min-width="150" />
              <el-table-column label="项目类型" min-width="120">
                <template #default="{ row }">
                  {{ formatItemType(row.itemType) }}
                </template>
              </el-table-column>
              <el-table-column label="单价" min-width="120">
                <template #default="{ row }">
                  <span v-if="row.unitPrice">¥ {{ formatAmount(row.unitPrice) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="数量" min-width="100">
                <template #default="{ row }">
                  <span v-if="row.quantity">{{ row.quantity }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="金额" prop="amount" min-width="120">
                <template #default="{ row }">
                  ¥ {{ formatAmount(row.amount) }}
                </template>
              </el-table-column>
              <el-table-column label="说明" prop="description" min-width="200" />
            </el-table>
          </div>
          
          <el-divider />
          
          <div class="time-info">
            <div class="time-row">
              <span class="time-label">创建时间:</span>
              <span>{{ salaryData.createTime }}</span>
            </div>
            <div class="time-row" v-if="salaryData.updateTime">
              <span class="time-label">更新时间:</span>
              <span>{{ salaryData.updateTime }}</span>
            </div>
            <div class="time-row" v-if="salaryData.paymentTime">
              <span class="time-label">发放时间:</span>
              <span>{{ salaryData.paymentTime }}</span>
            </div>
          </div>
        </div>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSalaryDetail, confirmSalary, paySalary, salaryStatusMap, salaryStatusTypeMap } from '@/api/salary'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const salaryData = ref<any>({})

onMounted(() => {
  fetchSalaryDetail()
})

// 获取工资详情
const fetchSalaryDetail = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    if (isNaN(id)) {
      ElMessage.error('无效的工资单ID')
      return goBack()
    }
    
    const res = await getSalaryDetail(id)
    salaryData.value = res.data
  } catch (error) {
    console.error('获取工资详情失败:', error)
    ElMessage.error('获取工资详情失败')
  } finally {
    loading.value = false
  }
}

// 确认工资单
const handleConfirm = async () => {
  try {
    const id = Number(route.params.id)
    await confirmSalary(id)
    ElMessage.success('工资单确认成功')
    fetchSalaryDetail()
  } catch (error) {
    console.error('确认工资单失败:', error)
  }
}

// 标记工资已发放
const handlePay = async () => {
  try {
    const id = Number(route.params.id)
    await paySalary(id)
    ElMessage.success('工资已标记为发放')
    fetchSalaryDetail()
  } catch (error) {
    console.error('标记工资已发放失败:', error)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toFixed(2)
}

// 格式化项目类型
const formatItemType = (type: string) => {
  const typeMap: Record<string, string> = {
    attendance: '出勤工资',
    overtime: '加班费',
    bonus: '奖金',
    subsidy: '补贴',
    deduction: '扣款'
  }
  return typeMap[type] || type
}
</script>

<style scoped>
.salary-detail-container {
  padding: 16px;
}

.detail-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.user-info h2 {
  margin: 0 0 10px 0;
}

.sub-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-tag {
  margin-left: 10px;
}

.period-info {
  text-align: right;
}

.period-info h3 {
  margin: 0 0 10px 0;
}

.summary-section {
  margin: 20px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.total-row {
  font-weight: bold;
  font-size: 18px;
  border-bottom: none;
  margin-top: 10px;
}

.total-amount {
  color: #409eff;
}

.detail-section {
  margin: 20px 0;
}

.detail-section h3 {
  margin-bottom: 15px;
}

.time-info {
  color: #999;
  font-size: 14px;
}

.time-row {
  margin-bottom: 5px;
}

.time-label {
  display: inline-block;
  width: 80px;
}
</style> 