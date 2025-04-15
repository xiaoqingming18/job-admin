<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Briefcase,
  Office,
  Document,
  Bell
} from '@element-plus/icons-vue'

const overviewData = ref({
  totalCompanies: 0,
  totalProjects: 0,
  totalJobs: 0,
  totalUsers: 0
})

const latestJobs = ref([])
const isLoading = ref(true)

// 用户信息
const userInfo = ref({
  name: '管理员',
  role: 'admin'
})

// 根据时间生成问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
})

// 快速统计数据
const quickStats = [
  {
    title: '企业总数',
    value: '128',
    icon: 'Office',
    color: '#409EFF',
    bgColor: '#ecf5ff'
  },
  {
    title: '项目数量',
    value: '56',
    icon: 'Briefcase',
    color: '#67C23A',
    bgColor: '#f0f9eb'
  },
  {
    title: '在招职位',
    value: '243',
    icon: 'Document',
    color: '#E6A23C',
    bgColor: '#fdf6ec'
  },
  {
    title: '用户数量',
    value: '1,432',
    icon: 'User',
    color: '#F56C6C',
    bgColor: '#fef0f0'
  }
]

// 图表时间范围
const chartTimeRange = ref('month')

// 待办事项
const todos = [
  {
    id: 1,
    title: '新企业注册审核',
    tag: '待审核',
    priority: 'warning',
    time: '10:30'
  },
  {
    id: 2,
    title: '项目合同待签署',
    tag: '紧急',
    priority: 'danger',
    time: '13:00'
  },
  {
    id: 3,
    title: '系统维护通知',
    tag: '通知',
    priority: 'info',
    time: '16:00'
  },
  {
    id: 4,
    title: '月度数据统计',
    tag: '进行中',
    priority: 'success',
    time: '今天'
  }
]

onMounted(() => {
  // Simulating API call
  setTimeout(() => {
    // Mock data for demonstration
    overviewData.value = {
      totalCompanies: 256,
      totalProjects: 145,
      totalJobs: 432,
      totalUsers: 1240
    }
    
    latestJobs.value = [
      { id: 1, title: '建筑工程师', company: '某某建筑公司', location: '北京', salary: '15k-25k', created_at: '2025-04-10' },
      { id: 2, title: '电气工程师', company: '某某工程公司', location: '上海', salary: '20k-30k', created_at: '2025-04-12' },
      { id: 3, title: '工程监理', company: '某某监理公司', location: '广州', salary: '18k-28k', created_at: '2025-04-13' },
      { id: 4, title: '安全员', company: '某某建筑集团', location: '深圳', salary: '12k-18k', created_at: '2025-04-14' },
      { id: 5, title: '土木工程师', company: '某某工程有限公司', location: '杭州', salary: '15k-22k', created_at: '2025-04-15' }
    ]
    
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="dashboard-home">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>{{ greeting }}，{{ userInfo.name }}</h1>
        <p class="subtitle">欢迎使用建筑行业劳务中介管理系统</p>
      </div>
      <div class="quick-stats">
        <el-row :gutter="24">
          <el-col :span="6" v-for="stat in quickStats" :key="stat.title">
            <el-card 
              class="stat-card" 
              :body-style="{ padding: '0' }"
              :style="{ '--gradient-color': stat.color }"
            >
              <div 
                class="stat-icon" 
                :style="{ 
                  backgroundColor: stat.bgColor,
                  color: stat.color
                }"
              >
                <el-icon :size="32">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 数据概览区域 -->
    <div class="data-overview">
      <el-row :gutter="20">
        <!-- 左侧图表 -->
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>项目统计</span>
                <el-radio-group v-model="chartTimeRange" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">全年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <!-- 这里可以集成 ECharts 等图表库 -->
              <div class="placeholder-chart">图表区域</div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 右侧通知和待办 -->
        <el-col :span="8">
          <el-card class="notification-card">
            <template #header>
              <div class="card-header">
                <span>待办事项</span>
                <el-button text>查看全部</el-button>
              </div>
            </template>
            <div class="todo-list">
              <div v-for="todo in todos" :key="todo.id" class="todo-item">
                <div class="todo-content">
                  <el-tag :type="todo.priority" size="small">{{ todo.tag }}</el-tag>
                  <span class="todo-title">{{ todo.title }}</span>
                </div>
                <span class="todo-time">{{ todo.time }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.dashboard-home {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-content {
  margin-bottom: 24px;
}

.welcome-content h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  height: 108px;
  transition: all 0.3s;
  padding: 24px;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to left, var(--gradient-color, rgba(255,255,255,0.1)), transparent);
  opacity: 0.1;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stat-card:hover::after {
  opacity: 0.2;
}

.stat-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  margin-right: 20px;
  transition: all 0.3s;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0.1;
}

.stat-info {
  flex: 1;
  position: relative;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.2;
  background: linear-gradient(45deg, #303133, #606266);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-title {
  font-size: 15px;
  color: #909399;
  line-height: 1;
  opacity: 0.95;
}

.data-overview {
  margin-top: 24px;
}

.chart-card, .notification-card {
  height: 450px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.placeholder-chart {
  color: #909399;
  font-size: 14px;
}

.todo-list {
  height: 380px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-title {
  color: #606266;
}

.todo-time {
  color: #909399;
  font-size: 12px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-card) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
</style>
