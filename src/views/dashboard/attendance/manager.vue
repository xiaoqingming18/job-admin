<template>
  <div class="attendance-manager-container">
    <!-- 查询条件卡片 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>项目考勤管理</span>
          <div>
            <el-button type="primary" @click="handleImport">批量导入</el-button>
            <el-button type="success" @click="handleExport">导出考勤</el-button>
            <el-button type="info" @click="goToLeaveManagement">请假管理</el-button>
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
          <el-tag type="info">{{ statisticsDateRange }}</el-tag>
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
        <el-table-column label="操作" width="200" fixed="right">
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
    
    <!-- 项目考勤设置卡片，当选择了项目时显示 -->
    <el-card v-if="queryParams.projectId" class="setting-card">
      <template #header>
        <div class="card-header">
          <span>考勤时间与加班费设置</span>
          <el-button type="primary" size="small" @click="handleOpenAttendanceSetting">
            {{ attendanceSetting ? '修改设置' : '设置考勤时间' }}
          </el-button>
        </div>
      </template>
      
      <div v-if="attendanceSetting" class="setting-content">
        <div class="setting-item">
          <div class="label">考勤开始时间:</div>
          <div class="value">{{ attendanceSetting.checkInTime || '未设置' }}</div>
        </div>
        <div class="setting-item">
          <div class="label">考勤结束时间:</div>
          <div class="value">{{ attendanceSetting.checkOutTime || '未设置' }}</div>
        </div>
        <div class="setting-item">
          <div class="label">加班费率(元/小时):</div>
          <div class="value">{{ attendanceSetting.overtimePayRate || '0.00' }}</div>
        </div>
      </div>
      <el-empty v-else description="暂未设置考勤时间" />
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
    
    <!-- 考勤设置对话框 -->
    <el-dialog
      v-model="attendanceSettingDialogVisible"
      :title="attendanceSetting ? '修改考勤设置' : '设置考勤时间'"
      width="500px"
    >
      <el-form :model="attendanceSettingForm" label-width="120px" :rules="settingRules" ref="settingFormRef">
        <el-form-item label="考勤开始时间" prop="checkInTime">
          <el-time-picker 
            v-model="attendanceSettingForm.checkInTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择考勤开始时间"
            :clearable="false"
          />
        </el-form-item>
        <el-form-item label="考勤结束时间" prop="checkOutTime">
          <el-time-picker 
            v-model="attendanceSettingForm.checkOutTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择考勤结束时间"
            :clearable="false"
          />
        </el-form-item>
        <el-form-item label="加班费(元/小时)" prop="overtimePayRate">
          <el-input-number 
            v-model="attendanceSettingForm.overtimePayRate" 
            :min="0" 
            :precision="2" 
            :step="0.5" 
            style="width: 160px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="attendanceSettingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAttendanceSettingSubmit">确认</el-button>
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
import { getCompanyAllProjects, getProjectAttendanceSetting, setProjectAttendanceSetting } from '@/api/project'
import { getProjectAttendanceRecords, getProjectAttendanceStatistics, updateAttendance, batchImportAttendance, exportAttendance } from '@/api/attendance'
import { getProjectMemberList } from '@/api/projectMember'
import type { Project, ProjectAttendanceSetting } from '@/types/project'
import type { ProjectMember } from '@/types/projectMember'
import type { MemberAttendanceDetail, Attendance, ProjectAttendanceStatistics, UpdateAttendanceRequest, AttendanceQueryParams } from '@/types/attendance'
import { AttendanceStatus, AttendanceStatusDesc } from '@/types/attendance'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'

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

// 项目考勤设置相关
const attendanceSetting = ref<ProjectAttendanceSetting | null>(null)
const attendanceSettingDialogVisible = ref(false)
const attendanceSettingForm = reactive({
  projectId: 0,
  checkInTime: '',
  checkOutTime: '',
  overtimePayRate: 0
})
const settingFormRef = ref<FormInstance>()
const settingRules = reactive<FormRules>({
  checkInTime: [
    { required: true, message: '请选择考勤开始时间', trigger: 'change' }
  ],
  checkOutTime: [
    { required: true, message: '请选择考勤结束时间', trigger: 'change' }
  ],
  overtimePayRate: [
    { type: 'number', min: 0, message: '加班费不能为负数', trigger: 'blur' }
  ]
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

// 加载项目列表
const loadProjects = async () => {
  try {
    if (!userStore.userInfo?.companyId) {
      ElMessage.warning('无法确定当前用户所属企业，无法加载项目列表')
      return
    }
    
    const companyId = userStore.userInfo.companyId
    const res = await getCompanyAllProjects(companyId)
    
    // 项目经理只能看到自己管理的项目
    const projectList = Array.isArray(res.data) ? res.data : (res.data.records || [])
    projects.value = projectList.filter(
      project => project.projectManagerId === userStore.userId
    )
    
    // 如果只有一个项目，自动选择
    if (projects.value.length === 1) {
      queryParams.projectId = projects.value[0].id
      handleProjectChange()
    }
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
    // 加载项目考勤设置
    await loadProjectAttendanceSetting()
  } else {
    // 清空成员列表和统计数据
    members.value = []
    projectMembers.value = []
    statistics.value = null
    attendanceSetting.value = null
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

// 加载项目成员列表
const loadProjectMembers = async () => {
  if (!queryParams.projectId) return
  
  try {
    const res = await getProjectMemberList(queryParams.projectId)
    // 直接将结果赋值给projectMembers，因为API返回的是数组而不是分页结果
    projectMembers.value = Array.isArray(res.data) ? res.data : (res.data || [])
    console.log('项目成员列表:', projectMembers.value)
  } catch (error) {
    console.error('加载项目成员列表失败:', error)
    ElMessage.error('加载项目成员列表失败')
  }
}

// 搜索考勤记录
const handleSearch = async () => {
  queryParams.page = 1
  await loadAttendanceRecords()
  await loadProjectStatistics()
}

// 重置查询条件
const resetQuery = () => {
  queryParams.memberId = undefined
  queryParams.status = undefined
  dateRange.value = null
  queryParams.startDate = undefined
  queryParams.endDate = undefined
  queryParams.page = 1
  
  loadAttendanceRecords()
  loadProjectStatistics()
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

// 查看考勤详情
const handleView = (row: Attendance) => {
  // 目前直接跳转到编辑，也可以实现单独的详情查看页面
  handleEdit(row)
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

// 加载项目考勤设置
const loadProjectAttendanceSetting = async () => {
  if (!queryParams.projectId) return
  
  try {
    const res = await getProjectAttendanceSetting(queryParams.projectId)
    attendanceSetting.value = res.data
  } catch (error) {
    console.error('加载项目考勤设置失败:', error)
    ElMessage.error('加载项目考勤设置失败')
  }
}

// 打开考勤设置对话框
const handleOpenAttendanceSetting = () => {
  if (!queryParams.projectId) {
    ElMessage.warning('请先选择项目')
    return
  }
  
  // 如果有已存在的设置，填充表单
  if (attendanceSetting.value) {
    attendanceSettingForm.checkInTime = attendanceSetting.value.checkInTime || ''
    attendanceSettingForm.checkOutTime = attendanceSetting.value.checkOutTime || ''
    attendanceSettingForm.overtimePayRate = attendanceSetting.value.overtimePayRate || 0
  } else {
    // 否则清空表单
    attendanceSettingForm.checkInTime = ''
    attendanceSettingForm.checkOutTime = ''
    attendanceSettingForm.overtimePayRate = 0
  }
  
  attendanceSettingForm.projectId = queryParams.projectId
  attendanceSettingDialogVisible.value = true
}

// 提交考勤设置
const handleAttendanceSettingSubmit = async () => {
  if (!settingFormRef.value) return
  
  await settingFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 确保时间格式为HH:mm
        const checkInTime = attendanceSettingForm.checkInTime ? 
          attendanceSettingForm.checkInTime.substring(0, 5) : '';
        const checkOutTime = attendanceSettingForm.checkOutTime ? 
          attendanceSettingForm.checkOutTime.substring(0, 5) : '';
          
        // 检查格式是否符合要求
        const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
        if (!timeRegex.test(checkInTime) || !timeRegex.test(checkOutTime)) {
          ElMessage.error('时间格式不正确，应为HH:mm格式，例如：09:00');
          return;
        }
        
        const res = await setProjectAttendanceSetting({
          projectId: attendanceSettingForm.projectId,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          overtimePayRate: attendanceSettingForm.overtimePayRate
        })
        
        ElMessage.success('项目考勤设置更新成功')
        attendanceSetting.value = res.data
        attendanceSettingDialogVisible.value = false
      } catch (error) {
        console.error('更新项目考勤设置失败:', error)
        ElMessage.error('更新项目考勤设置失败')
      }
    }
  })
}

// 跳转到请假管理页面
const goToLeaveManagement = () => {
  router.push('/dashboard/leave/manager')
}

// 组件挂载时加载数据
const router = useRouter()
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.attendance-manager-container {
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

.setting-card {
  margin-top: 20px;
}

.setting-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.setting-item {
  min-width: 200px;
  display: flex;
  align-items: center;
}

.setting-item .label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.setting-item .value {
  font-size: 16px;
  color: #303133;
}
</style> 