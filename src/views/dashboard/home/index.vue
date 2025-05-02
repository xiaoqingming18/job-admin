<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Briefcase,
  Office,
  Document,
  Bell,
  ChatDotRound
} from '@element-plus/icons-vue'
import { getDashboardDataByRole } from '@/api/dashboard'
import { isAdmin, isCompanyAdmin, isProjectManager, getUserType } from '@/utils/auth'
import { getSocket } from '@/utils/socket'

const router = useRouter()

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

// 获取当前用户类型
const userType = ref(getUserType())

// 是否为系统管理员
const isSystemAdmin = computed(() => isAdmin())
// 是否为企业管理员
const isCompanyAdminUser = computed(() => isCompanyAdmin())
// 是否为项目经理
const isProjectManagerUser = computed(() => isProjectManager())

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

// 快速统计数据 - 根据用户角色动态生成
const quickStats = computed(() => {
  if (isSystemAdmin.value) {
    return [
      {
        title: '企业总数',
        value: overviewData.value.totalCompanies.toString(),
        icon: 'Office',
        color: '#409EFF',
        bgColor: '#ecf5ff'
      },
      {
        title: '项目数量',
        value: overviewData.value.totalProjects.toString(),
        icon: 'Briefcase',
        color: '#67C23A',
        bgColor: '#f0f9eb'
      },
      {
        title: '在招职位',
        value: overviewData.value.totalJobs.toString(),
        icon: 'Document',
        color: '#E6A23C',
        bgColor: '#fdf6ec'
      },
      {
        title: '用户数量',
        value: overviewData.value.totalUsers.toString(),
        icon: 'User',
        color: '#F56C6C',
        bgColor: '#fef0f0'
      }
    ]
  } else if (isCompanyAdminUser.value) {
    return [
      {
        title: '企业项目',
        value: overviewData.value.totalProjects.toString(),
        icon: 'Briefcase',
        color: '#67C23A',
        bgColor: '#f0f9eb'
      },
      {
        title: '项目经理',
        value: overviewData.value.totalUsers.toString(),
        icon: 'User',
        color: '#F56C6C',
        bgColor: '#fef0f0'
      },
      {
        title: '职位发布',
        value: overviewData.value.totalJobs.toString(),
        icon: 'Document',
        color: '#E6A23C',
        bgColor: '#fdf6ec'
      },
      {
        title: '今日申请',
        value: overviewData.value.totalApplications?.toString() || '0',
        icon: 'Bell',
        color: '#909399',
        bgColor: '#f4f4f5'
      }
    ]
  } else if (isProjectManagerUser.value) {
    return [
      {
        title: '管理项目',
        value: overviewData.value.totalProjects.toString(),
        icon: 'Briefcase',
        color: '#67C23A',
        bgColor: '#f0f9eb'
      },
      {
        title: '项目人员',
        value: overviewData.value.totalWorkers?.toString() || '0',
        icon: 'User',
        color: '#F56C6C',
        bgColor: '#fef0f0'
      },
      {
        title: '职位发布',
        value: overviewData.value.totalJobs.toString(),
        icon: 'Document',
        color: '#E6A23C',
        bgColor: '#fdf6ec'
      },
      {
        title: '今日申请',
        value: overviewData.value.todayApplications?.toString() || '0',
        icon: 'Bell',
        color: '#909399',
        bgColor: '#f4f4f5'
      }
    ]
  }
  
  return []
})

// 图表时间范围
const chartTimeRange = ref('month')

// 待办事项
const todos = ref([])

// 未读消息数
const unreadCount = ref(3)

// 进入聊天页面
const goToChat = () => {
  router.push('/dashboard/chat')
}

// 加载看板数据
const loadDashboardData = async () => {
  isLoading.value = true
  try {
    // 注释掉调用后端API的代码
    // const res = await getDashboardDataByRole(userType.value)
    // if (res && res.data) {
    //   overviewData.value = res.data
    //   
    //   // 设置用户信息
    //   userInfo.value = {
    //     name: res.data.userName || '用户',
    //     role: userType.value
    //   }
    //   
    //   // 设置最新职位
    //   if (res.data.latestJobs) {
    //     latestJobs.value = res.data.latestJobs
    //   }
    // }
    
    // 直接使用模拟数据
    mockDashboardData()
    mockTodoData()
  } catch (error) {
    console.error('获取看板数据失败', error)
    // ElMessage.error('获取看板数据失败，请稍后再试')
    
    // 模拟数据用于开发测试
    mockDashboardData()
    mockTodoData()
  } finally {
    isLoading.value = false
  }
}

// 模拟数据用于开发测试
const mockDashboardData = () => {
  if (isSystemAdmin.value) {
    overviewData.value = {
      totalCompanies: 256,
      totalProjects: 145,
      totalJobs: 432,
      totalUsers: 1240
    }
  } else if (isCompanyAdminUser.value) {
    overviewData.value = {
      totalProjects: 48,
      totalUsers: 21,
      totalJobs: 64,
      totalApplications: 12
    }
  } else if (isProjectManagerUser.value) {
    overviewData.value = {
      totalProjects: 8,
      totalWorkers: 56,
      totalJobs: 15,
      todayApplications: 5
    }
  }
  
  latestJobs.value = [
    { id: 1, title: '建筑工程师', company: '某某建筑公司', location: '北京', salary: '15k-25k', created_at: '2025-04-10' },
    { id: 2, title: '电气工程师', company: '某某工程公司', location: '上海', salary: '20k-30k', created_at: '2025-04-12' },
    { id: 3, title: '工程监理', company: '某某监理公司', location: '广州', salary: '18k-28k', created_at: '2025-04-13' },
    { id: 4, title: '安全员', company: '某某建筑集团', location: '深圳', salary: '12k-18k', created_at: '2025-04-14' },
    { id: 5, title: '土木工程师', company: '某某工程有限公司', location: '杭州', salary: '15k-22k', created_at: '2025-04-15' }
  ]
}

// 模拟待办事项
const mockTodoData = () => {
  if (isSystemAdmin.value) {
    todos.value = [
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
  } else if (isCompanyAdminUser.value) {
    todos.value = [
      {
        id: 1,
        title: '待审核职位申请',
        tag: '待审核',
        priority: 'warning',
        time: '09:15'
      },
      {
        id: 2,
        title: '项目合同待更新',
        tag: '紧急',
        priority: 'danger',
        time: '14:30'
      },
      {
        id: 3,
        title: '人员考勤异常',
        tag: '提醒',
        priority: 'info',
        time: '昨天'
      }
    ]
  } else if (isProjectManagerUser.value) {
    todos.value = [
      {
        id: 1,
        title: '项目进度更新',
        tag: '待处理',
        priority: 'warning',
        time: '11:00'
      },
      {
        id: 2,
        title: '安全检查提醒',
        tag: '紧急',
        priority: 'danger',
        time: '今天'
      },
      {
        id: 3,
        title: '材料采购审核',
        tag: '待审核',
        priority: 'info',
        time: '明天'
      }
    ]
  }
}

onMounted(() => {
  loadDashboardData()
  
  // 如果是项目经理，监听新消息
  if (isProjectManagerUser.value) {
    const socket = getSocket()
    if (socket) {
      // 监听新消息，可以更新未读数
      socket.on('receive_message', () => {
        unreadCount.value += 1
      })
    }
  }
})

// 在组件销毁前移除监听器
onBeforeUnmount(() => {
  if (isProjectManagerUser.value) {
    const socket = getSocket()
    if (socket) {
      socket.off('receive_message')
    }
  }
})
</script>

<template>
  <div class="dashboard-home">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>{{ greeting }}，{{ userInfo.name }}</h1>
        <p class="subtitle" v-if="isSystemAdmin">欢迎使用建筑行业劳务中介管理系统，您可以管理所有企业、项目和用户</p>
        <p class="subtitle" v-else-if="isCompanyAdminUser">欢迎使用建筑行业劳务中介管理系统，您可以管理贵公司的项目和人员</p>
        <p class="subtitle" v-else-if="isProjectManagerUser">欢迎使用建筑行业劳务中介管理系统，您可以管理您负责的项目和人员</p>
      </div>

      <!-- 即时通讯入口 - 仅项目经理可见 -->
      <div class="chat-entrance" v-if="isProjectManagerUser">
        <el-card class="chat-card">
          <div class="chat-card-content">
            <div class="chat-icon">
              <el-badge :value="unreadCount || null" :hidden="!unreadCount">
                <el-icon :size="40"><ChatDotRound /></el-icon>
              </el-badge>
            </div>
            <div class="chat-info">
              <h3>在线沟通</h3>
              <p>与求职者实时交流，快速响应申请</p>
            </div>
            <el-button type="primary" @click="goToChat">进入聊天</el-button>
          </div>
        </el-card>
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
                <span v-if="isSystemAdmin">项目统计</span>
                <span v-else-if="isCompanyAdminUser">企业项目统计</span>
                <span v-else-if="isProjectManagerUser">项目进度统计</span>
                <el-radio-group v-model="chartTimeRange" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">全年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <!-- 这里可以集成 ECharts 等图表库 -->
              <div class="placeholder-chart">{{ isLoading ? '加载中...' : '图表区域' }}</div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 右侧通知和待办 -->
        <el-col :span="8">
          <el-card class="notification-card">
            <template #header>
              <div class="card-header">
                <span>待办事项</span>
                <el-button link>查看全部</el-button>
              </div>
            </template>
            <div v-if="isLoading" class="loading-state">
              <el-skeleton :rows="4" animated />
            </div>
            <div v-else class="todo-list">
              <div v-for="todo in todos" :key="todo.id" class="todo-item">
                <div class="todo-content">
                  <el-tag :type="todo.priority" size="small">{{ todo.tag }}</el-tag>
                  <span class="todo-title">{{ todo.title }}</span>
                </div>
                <span class="todo-time">{{ todo.time }}</span>
              </div>
              <div v-if="todos.length === 0" class="empty-state">
                暂无待办事项
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近职位信息 -->
    <div class="latest-jobs" v-if="latestJobs.length > 0">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>最新职位</span>
            <el-button link>查看更多</el-button>
          </div>
        </template>
        <el-table :data="latestJobs" style="width: 100%" border stripe>
          <el-table-column prop="title" label="职位名称" min-width="180" />
          <el-table-column prop="company" label="企业名称" min-width="180" />
          <el-table-column prop="location" label="工作地点" width="120" />
          <el-table-column prop="salary" label="薪资范围" width="120" />
          <el-table-column prop="created_at" label="发布日期" width="100" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
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
  margin-bottom: 24px;
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

.loading-state, .empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.latest-jobs {
  margin-top: 24px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-card) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

/* 聊天入口样式 */
.chat-entrance {
  margin-bottom: 24px;
}

.chat-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f0fe 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.chat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.chat-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.chat-icon {
  color: #409eff;
  margin-right: 20px;
}

.chat-info {
  flex: 1;
}

.chat-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.chat-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}
</style>
