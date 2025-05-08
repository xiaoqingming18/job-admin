<template>
  <div class="attendance-company-container">
    <!-- 查询条件卡片 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>考勤管理</span>
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
          <el-select v-model="queryParams.memberId" placeholder="选择成员" clearable filterable :disabled="!queryParams.projectId">
            <el-option
              v-for="item in projectMembers"
              :key="item.userId"
              :label="item.realName || item.username"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="考勤状态" clearable>
            <el-option
              v-for="(value, key) in attendanceStatusOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 统计信息卡片 -->
    <el-card v-if="queryParams.projectId && statistics" class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>考勤统计</span>
          <div>
            <el-tag type="info">{{ statisticsDateRange }}</el-tag>
            <el-button type="success" size="small" style="margin-left: 10px;" @click="handleExport">导出考勤</el-button>
            <el-button type="primary" size="small" style="margin-left: 10px;" @click="handleImport">批量导入</el-button>
          </div>
        </div>
      </template>
      
      <div class="statistics-content">
        <div class="statistics-item">
          <div class="stat-title">项目总人数</div>
          <div class="stat-value">{{ statistics.projectInfo.totalMembers }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">统计天数</div>
          <div class="stat-value">{{ statistics.attendanceSummary.totalDays }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">工作日</div>
          <div class="stat-value">{{ statistics.attendanceSummary.workDays }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">总出勤人次</div>
          <div class="stat-value">{{ statistics.attendanceSummary.totalAttendanceCount }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">正常出勤</div>
          <div class="stat-value">{{ statistics.attendanceSummary.normalCount }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">迟到</div>
          <div class="stat-value">{{ statistics.attendanceSummary.lateCount }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">早退</div>
          <div class="stat-value">{{ statistics.attendanceSummary.earlyLeaveCount }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">缺勤</div>
          <div class="stat-value">{{ statistics.attendanceSummary.absenceCount }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">请假</div>
          <div class="stat-value">{{ statistics.attendanceSummary.leaveCount }}</div>
        </div>
        <div class="statistics-item">
          <div class="stat-title">平均出勤率</div>
          <div class="stat-value">{{ statistics.attendanceSummary.averageAttendanceRate }}%</div>
        </div>
      </div>
    </el-card>
    
    <!-- 考勤记录表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>考勤记录</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="attendanceList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="projectName" label="项目名称" min-width="120" />
        <el-table-column prop="userName" label="姓名" width="100" />
        <el-table-column prop="attendanceDate" label="日期" width="120" />
        <el-table-column prop="checkInTime" label="签到时间" width="100" />
        <el-table-column prop="checkOutTime" label="签退时间" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workHours" label="工时(小时)" width="100">
          <template #default="scope">
            {{ scope.row.workHours || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" min-width="150" show-overflow-tooltip />
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 编辑考勤对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑考勤记录"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="签到时间">
          <el-time-picker 
            v-model="editForm.checkInTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择签到时间"
          />
        </el-form-item>
        <el-form-item label="签退时间">
          <el-time-picker 
            v-model="editForm.checkOutTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择签退时间"
          />
        </el-form-item>
        <el-form-item label="考勤状态">
          <el-select v-model="editForm.status" placeholder="选择状态">
            <el-option
              v-for="(value, key) in attendanceStatusOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作时长">
          <el-input-number v-model="editForm.workHours" :min="0" :max="24" :precision="1" :step="0.5" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remarks" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 导入考勤对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入考勤记录"
      width="500px"
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="项目">
          <el-select v-model="importForm.projectId" placeholder="选择项目" required>
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Excel文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xls,.xlsx"
            :on-change="handleFileChange"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传Excel文件，只能上传 xls/xlsx 格式
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportSubmit" :disabled="!importForm.file">导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCompanyAllProjects } from '@/api/project'
import { getProjectAttendanceRecords, getProjectAttendanceStatistics, updateAttendance, batchImportAttendance, exportAttendance } from '@/api/attendance'
import { getProjectMemberList } from '@/api/projectMember'
import type { Project } from '@/types/project'
import type { ProjectMember } from '@/types/projectMember'
import type { MemberAttendanceDetail, Attendance, ProjectAttendanceStatistics, UpdateAttendanceRequest, AttendanceQueryParams } from '@/types/attendance'
import { AttendanceStatus, AttendanceStatusDesc } from '@/types/attendance'

// 用户权限相关
const userStore = useUserStore()

// 考勤状态选项
const attendanceStatusOptions = AttendanceStatusDesc

// 项目列表
const projects = ref<Project[]>([])

// 项目成员列表
const members = ref<MemberAttendanceDetail[]>([])

// 项目成员列表
const projectMembers = ref<ProjectMember[]>([])

// 查询参数
const queryParams = reactive<AttendanceQueryParams>({
  projectId: undefined,
  memberId: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  size: 10
})

// 日期范围选择
const dateRange = ref<[string, string] | null>(null)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 考勤记录列表
const attendanceList = ref<Attendance[]>([])
const total = ref(0)
const loading = ref(false)

// 考勤统计数据
const statistics = ref<ProjectAttendanceStatistics | null>(null)

// 统计日期范围显示
const statisticsDateRange = computed(() => {
  if (queryParams.startDate && queryParams.endDate) {
    return `${queryParams.startDate} 至 ${queryParams.endDate}`
  }
  return '当月'
})

// 编辑表单相关
const editDialogVisible = ref(false)
const editForm = reactive<UpdateAttendanceRequest & { id?: number }>({
  checkInTime: '',
  checkOutTime: '',
  status: undefined,
  workHours: undefined,
  remarks: ''
})
const currentRecord = ref<Attendance | null>(null)

// 导入表单相关
const importDialogVisible = ref(false)
const uploadRef = ref()
const importForm = reactive({
  projectId: undefined as number | undefined,
  file: null as File | null
})

// 监听日期范围变化
watch(dateRange, (newValue) => {
  if (newValue) {
    queryParams.startDate = newValue[0]
    queryParams.endDate = newValue[1]
  } else {
    queryParams.startDate = undefined
    queryParams.endDate = undefined
  }
})

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case AttendanceStatus.NORMAL:
      return 'success'
    case AttendanceStatus.LATE:
      return 'warning'
    case AttendanceStatus.EARLY_LEAVE:
      return 'warning'
    case AttendanceStatus.ABSENT:
      return 'danger'
    case AttendanceStatus.LEAVE:
      return 'info'
    case AttendanceStatus.HOLIDAY:
      return 'info'
    default:
      return 'info'
  }
}

// 加载企业项目列表
const loadProjects = async () => {
  try {
    if (!userStore.userInfo?.companyId) {
      ElMessage.warning('无法确定当前用户所属企业，无法加载项目列表')
      return
    }
    
    const companyId = userStore.userInfo.companyId
    const res = await getCompanyAllProjects(companyId)
    projects.value = Array.isArray(res.data) ? res.data : (res.data.records || [])
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  }
}

// 处理项目变更
const handleProjectChange = async () => {
  if (queryParams.projectId) {
    // 清空已选择的成员
    queryParams.memberId = undefined
    // 加载项目成员列表
    await loadProjectMembers()
    // 加载项目考勤统计
    await loadProjectStatistics()
    // 加载考勤记录
    await loadAttendanceRecords()
  } else {
    // 清空成员列表和统计数据
    members.value = []
    projectMembers.value = []
    statistics.value = null
  }
}

// 加载项目成员列表
const loadProjectMembers = async () => {
  if (!queryParams.projectId) return
  
  try {
    const res = await getProjectMemberList(queryParams.projectId)
    projectMembers.value = res.data.records || res.data.list || []
  } catch (error) {
    console.error('加载项目成员列表失败:', error)
    ElMessage.error('加载项目成员列表失败')
  }
}

// 加载项目统计数据
const loadProjectStatistics = async () => {
  if (!queryParams.projectId) return
  
  try {
    const params = {
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      memberId: queryParams.memberId
    }
    
    const res = await getProjectAttendanceStatistics(queryParams.projectId, params)
    statistics.value = res.data
    members.value = statistics.value.memberDetails
  } catch (error) {
    console.error('加载考勤统计失败:', error)
    ElMessage.error('加载考勤统计失败')
  }
}

// 加载考勤记录
const loadAttendanceRecords = async () => {
  if (!queryParams.projectId) return
  
  loading.value = true
  try {
    const res = await getProjectAttendanceRecords(
      queryParams.projectId, 
      {
        memberId: queryParams.memberId,
        status: queryParams.status,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        page: queryParams.page,
        size: queryParams.size
      }
    )
    attendanceList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('加载考勤记录失败:', error)
    ElMessage.error('加载考勤记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索考勤记录
const handleSearch = async () => {
  queryParams.page = 1
  
  if (queryParams.projectId) {
    await loadAttendanceRecords()
    await loadProjectStatistics()
  }
}

// 重置查询条件
const resetQuery = () => {
  queryParams.projectId = undefined
  queryParams.memberId = undefined
  queryParams.status = undefined
  dateRange.value = null
  queryParams.startDate = undefined
  queryParams.endDate = undefined
  queryParams.page = 1
  
  members.value = []
  projectMembers.value = []
  statistics.value = null
  attendanceList.value = []
  total.value = 0
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.size = size
  loadAttendanceRecords()
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  loadAttendanceRecords()
}

// 编辑考勤记录
const handleEdit = (row: Attendance) => {
  currentRecord.value = row
  editForm.id = row.id
  editForm.checkInTime = row.checkInTime
  editForm.checkOutTime = row.checkOutTime || ''
  editForm.status = row.status
  editForm.workHours = row.workHours || undefined
  editForm.remarks = row.remarks || ''
  
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editForm.id) return
  
  try {
    await updateAttendance(editForm.id, {
      checkInTime: editForm.checkInTime,
      checkOutTime: editForm.checkOutTime || undefined,
      status: editForm.status,
      workHours: editForm.workHours,
      remarks: editForm.remarks
    })
    
    ElMessage.success('更新考勤记录成功')
    editDialogVisible.value = false
    
    // 重新加载数据
    loadAttendanceRecords()
    loadProjectStatistics()
  } catch (error) {
    console.error('更新考勤记录失败:', error)
    ElMessage.error('更新考勤记录失败')
  }
}

// 打开导入对话框
const handleImport = () => {
  importForm.projectId = queryParams.projectId
  importForm.file = null
  importDialogVisible.value = true
}

// 处理文件选择变更
const handleFileChange = (file: any) => {
  importForm.file = file.raw
}

// 提交导入
const handleImportSubmit = async () => {
  if (!importForm.projectId) {
    ElMessage.warning('请选择项目')
    return
  }
  
  if (!importForm.file) {
    ElMessage.warning('请选择Excel文件')
    return
  }
  
  try {
    const result = await batchImportAttendance(importForm.projectId, importForm.file)
    
    ElMessage.success(`导入成功: 总共${result.data.totalCount}条，成功${result.data.successCount}条，失败${result.data.failureCount}条`)
    importDialogVisible.value = false
    
    // 重新加载数据
    loadAttendanceRecords()
    loadProjectStatistics()
  } catch (error) {
    console.error('导入考勤记录失败:', error)
    ElMessage.error('导入考勤记录失败')
  }
}

// 导出考勤记录
const handleExport = async () => {
  if (!queryParams.projectId) {
    ElMessage.warning('请选择项目')
    return
  }
  
  if (!queryParams.startDate || !queryParams.endDate) {
    ElMessage.warning('请选择导出日期范围')
    return
  }
  
  try {
    const params = {
      projectId: queryParams.projectId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      memberId: queryParams.memberId
    }
    
    const response = await exportAttendance(params)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    
    // 文件名格式: 项目名称-考勤记录-开始日期-结束日期.xlsx
    const projectName = projects.value.find(p => p.id === queryParams.projectId)?.name || '未知项目'
    link.download = `${projectName}-考勤记录-${queryParams.startDate}-${queryParams.endDate}.xlsx`
    
    link.click()
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出考勤记录失败:', error)
    ElMessage.error('导出考勤记录失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.attendance-company-container {
  padding: 20px;
}

.search-card,
.statistics-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.statistics-item {
  min-width: 120px;
  flex: 1;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.stat-title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 