<template>
  <div class="attendance-statistics-container">
    <el-card class="filter-card">
      <div class="filter-section">
        <h3>考勤统计筛选</h3>
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" class="filter-form-content">
            <el-form-item label="企业">
              <el-select v-model="queryParams.companyId" placeholder="请选择企业" @change="handleCompanyChange">
                <el-option
                  v-for="company in companies"
                  :key="company.id"
                  :label="company.name"
                  :value="company.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目">
              <el-select v-model="queryParams.projectId" placeholder="请选择项目" @change="handleProjectChange" :disabled="!queryParams.companyId">
                <el-option
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :shortcuts="dateShortcuts"
                @change="handleDateRangeChange"
              />
            </el-form-item>
            <el-form-item label="成员">
              <el-select 
                v-model="queryParams.memberId" 
                placeholder="请选择成员" 
                clearable 
                :disabled="!queryParams.projectId"
              >
                <el-option
                  v-for="member in projectMembers"
                  :key="member.userId"
                  :label="member.realName || member.username"
                  :value="member.userId"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadAttendanceStatistics">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
              <el-button type="success" @click="exportStatistics">导出统计</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <el-card class="statistics-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h3>{{ selectedProjectName || '未选择项目' }} - 考勤统计</h3>
          <span>{{ formatDateRange }}</span>
        </div>
      </template>

      <div v-if="statistics" class="statistics-content">
        <div class="summary-section">
          <h4>考勤汇总</h4>
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="summary-item">
                <div class="summary-label">总天数</div>
                <div class="summary-value">{{ statistics.attendanceSummary.totalDays }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="summary-item">
                <div class="summary-label">工作日</div>
                <div class="summary-value">{{ statistics.attendanceSummary.workDays }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="summary-item">
                <div class="summary-label">正常出勤</div>
                <div class="summary-value">{{ statistics.attendanceSummary.normalCount }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="summary-item">
                <div class="summary-label">迟到</div>
                <div class="summary-value">{{ statistics.attendanceSummary.lateCount }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="summary-item">
                <div class="summary-label">早退</div>
                <div class="summary-value">{{ statistics.attendanceSummary.earlyLeaveCount }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="summary-item">
                <div class="summary-label">平均出勤率</div>
                <div class="summary-value">{{ statistics.attendanceSummary.averageAttendanceRate }}%</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="chart-section">
          <div class="chart-container">
            <h4>出勤情况图表</h4>
            <div id="attendanceChart" class="chart"></div>
          </div>
        </div>

        <div class="members-section">
          <h4>成员详情</h4>
          <el-table :data="statistics.memberDetails" style="width: 100%" stripe border>
            <el-table-column prop="userName" label="姓名" width="120" />
            <el-table-column prop="attendanceDays" label="出勤天数" width="100" align="center" />
            <el-table-column prop="normalDays" label="正常出勤" width="100" align="center" />
            <el-table-column prop="lateDays" label="迟到" width="80" align="center" />
            <el-table-column prop="earlyLeaveDays" label="早退" width="80" align="center" />
            <el-table-column prop="absenceDays" label="缺勤" width="80" align="center" />
            <el-table-column prop="leaveDays" label="请假" width="80" align="center" />
            <el-table-column prop="attendanceRate" label="出勤率" width="100" align="center">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.attendanceRate" 
                  :color="getAttendanceRateColor(scope.row.attendanceRate)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="scope">
                <el-button size="small" type="primary" @click="viewMemberDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-data">
        <el-empty description="暂无考勤统计数据，请选择项目和日期范围" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { getCompanyList } from '@/api/company'
import { getProjectList } from '@/api/project'
import { getProjectMemberList } from '@/api/projectMember'
import { 
  getProjectAttendanceStatistics,
  exportAttendanceStatistics
} from '@/api/attendance'

// 定义查询参数
const queryParams = reactive({
  companyId: undefined,
  projectId: undefined,
  startDate: '',
  endDate: '',
  memberId: undefined
})

// 数据加载状态
const loading = ref(false)
const companies = ref([])
const projects = ref([])
const projectMembers = ref([])
const statistics = ref(null)
const dateRange = ref([])
const selectedProjectName = ref('')
const attendanceChart = ref(null)

// 计算属性：日期范围格式化显示
const formatDateRange = computed(() => {
  if (queryParams.startDate && queryParams.endDate) {
    return `${queryParams.startDate} 至 ${queryParams.endDate}`
  }
  return '未选择日期范围'
})

// 日期选择快捷选项
const dateShortcuts = [
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const end = new Date()
      end.setDate(0) // 设置为上月最后一天
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      return [start, end]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
      return [start, end]
    }
  }
]

// 获取企业列表
const loadCompanies = async () => {
  try {
    loading.value = true
    const res = await getCompanyList({
      pageNum: 1,
      pageSize: 100,
      status: 'active'
    })
    companies.value = res.data.list || []
  } catch (error) {
    console.error('加载企业列表失败:', error)
    ElMessage.error('加载企业列表失败')
  } finally {
    loading.value = false
  }
}

// 处理企业变更
const handleCompanyChange = (companyId) => {
  if (companyId) {
    loadProjects(companyId)
    queryParams.projectId = undefined // 重置项目选择
    selectedProjectName.value = ''
    projectMembers.value = []
    statistics.value = null
  } else {
    projects.value = []
    queryParams.projectId = undefined
    selectedProjectName.value = ''
    projectMembers.value = []
    statistics.value = null
  }
}

// 获取项目列表
const loadProjects = async (companyId) => {
  if (!companyId) return
  
  try {
    loading.value = true
    const res = await getProjectList({
      pageNum: 1,
      pageSize: 100,
      companyId,
      status: 'active'
    })
    projects.value = res.data.list || []
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 加载项目成员列表
const loadProjectMembers = async () => {
  if (!queryParams.projectId) return
  
  try {
    const res = await getProjectMemberList(queryParams.projectId)
    projectMembers.value = res.data || []
  } catch (error) {
    console.error('加载项目成员列表失败:', error)
    ElMessage.error('加载项目成员列表失败')
  }
}

// 处理项目变更
const handleProjectChange = (projectId) => {
  if (projectId) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      selectedProjectName.value = project.name
    }
    loadProjectMembers()
    queryParams.memberId = undefined // 重置成员选择
  } else {
    selectedProjectName.value = ''
    projectMembers.value = []
  }
}

// 处理日期范围变更
const handleDateRangeChange = (val) => {
  if (val) {
    queryParams.startDate = val[0]
    queryParams.endDate = val[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
}

// 加载考勤统计数据
const loadAttendanceStatistics = async () => {
  if (!queryParams.projectId) {
    ElMessage.warning('请先选择项目')
    return
  }
  
  if (!queryParams.startDate || !queryParams.endDate) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  try {
    loading.value = true
    const res = await getProjectAttendanceStatistics(
      queryParams.projectId,
      {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        memberId: queryParams.memberId
      }
    )
    
    statistics.value = res.data
    
    // 在数据加载后初始化图表
    nextTick(() => {
      initAttendanceChart()
    })
  } catch (error) {
    console.error('加载考勤统计数据失败:', error)
    ElMessage.error('加载考勤统计数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化考勤图表
const initAttendanceChart = () => {
  if (!statistics.value) return
  
  // 确保DOM元素已存在
  const chartDom = document.getElementById('attendanceChart')
  if (!chartDom) return
  
  // 销毁旧图表
  if (attendanceChart.value) {
    attendanceChart.value.dispose()
  }
  
  // 创建新图表
  attendanceChart.value = echarts.init(chartDom)
  
  // 准备图表数据
  const { normalCount, lateCount, earlyLeaveCount, absenceCount, leaveCount } = statistics.value.attendanceSummary
  
  // 配置图表选项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: ['正常出勤', '迟到', '早退', '缺勤', '请假']
    },
    series: [
      {
        name: '考勤情况',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: normalCount, name: '正常出勤', itemStyle: { color: '#67C23A' } },
          { value: lateCount, name: '迟到', itemStyle: { color: '#E6A23C' } },
          { value: earlyLeaveCount, name: '早退', itemStyle: { color: '#F56C6C' } },
          { value: absenceCount, name: '缺勤', itemStyle: { color: '#909399' } },
          { value: leaveCount, name: '请假', itemStyle: { color: '#409EFF' } }
        ]
      }
    ]
  }
  
  // 设置图表选项
  attendanceChart.value.setOption(option)
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    attendanceChart.value && attendanceChart.value.resize()
  })
}

// 导出统计数据
const exportStatistics = async () => {
  if (!queryParams.projectId) {
    ElMessage.warning('请先选择项目')
    return
  }
  
  if (!queryParams.startDate || !queryParams.endDate) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  try {
    loading.value = true
    await exportAttendanceStatistics(
      queryParams.projectId,
      {
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        memberId: queryParams.memberId
      }
    )
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出考勤统计数据失败:', error)
    ElMessage.error('导出考勤统计数据失败')
  } finally {
    loading.value = false
  }
}

// 查看成员详情
const viewMemberDetail = (member) => {
  ElMessageBox.alert(
    `
    <div style="text-align: left;">
      <p><strong>姓名:</strong> ${member.userName}</p>
      <p><strong>出勤天数:</strong> ${member.attendanceDays}</p>
      <p><strong>正常出勤:</strong> ${member.normalDays}</p>
      <p><strong>迟到:</strong> ${member.lateDays}</p>
      <p><strong>早退:</strong> ${member.earlyLeaveDays}</p>
      <p><strong>缺勤:</strong> ${member.absenceDays}</p>
      <p><strong>请假:</strong> ${member.leaveDays}</p>
      <p><strong>出勤率:</strong> ${member.attendanceRate}%</p>
    </div>
    `,
    '成员考勤详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 获取出勤率颜色
const getAttendanceRateColor = (rate) => {
  if (rate >= 90) return '#67C23A' // 绿色
  if (rate >= 80) return '#409EFF' // 蓝色
  if (rate >= 70) return '#E6A23C' // 黄色
  return '#F56C6C' // 红色
}

// 重置查询
const resetQuery = () => {
  queryParams.companyId = undefined
  queryParams.projectId = undefined
  queryParams.startDate = ''
  queryParams.endDate = ''
  queryParams.memberId = undefined
  dateRange.value = []
  selectedProjectName.value = ''
  statistics.value = null
  projects.value = []
  projectMembers.value = []
}

// 组件挂载后执行
onMounted(() => {
  loadCompanies()
})
</script>

<style scoped>
.attendance-statistics-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-section h3,
.statistics-card .card-header h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.filter-form-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-section,
.chart-section,
.members-section {
  margin-bottom: 30px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.summary-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.chart-container {
  height: 300px;
}

#attendanceChart {
  width: 100%;
  height: 100%;
}

.empty-data {
  padding: 30px;
  text-align: center;
}
</style> 