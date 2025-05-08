<template>
  <div class="attendance-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考勤详情</span>
          <el-button type="primary" @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <el-descriptions v-loading="loading" :column="2" border>
        <el-descriptions-item label="记录ID">{{ attendance?.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ attendance?.projectName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="员工姓名">{{ attendance?.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考勤日期">{{ attendance?.attendanceDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签到时间">{{ attendance?.checkInTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签退时间">{{ attendance?.checkOutTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考勤状态">
          <el-tag :type="getStatusType(attendance?.status)">
            {{ attendance?.statusDesc || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="工作时长(小时)">{{ attendance?.workHours || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签到地点">{{ attendance?.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ attendance?.remarks || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ attendance?.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="action-bar">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { updateAttendance } from '@/api/attendance'
import type { Attendance, UpdateAttendanceRequest } from '@/types/attendance'
import { AttendanceStatus, AttendanceStatusDesc } from '@/types/attendance'

const route = useRoute()
const router = useRouter()

// 考勤状态选项
const attendanceStatusOptions = AttendanceStatusDesc

// 加载状态
const loading = ref(false)

// 考勤记录
const attendance = ref<Attendance | null>(null)

// 编辑对话框
const editDialogVisible = ref(false)
const editForm = reactive<UpdateAttendanceRequest & { id?: number }>({
  checkInTime: '',
  checkOutTime: '',
  status: undefined,
  workHours: undefined,
  remarks: ''
})

// 获取状态标签类型
const getStatusType = (status?: string) => {
  if (!status) return 'info'
  
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

// 加载考勤详情
const loadAttendanceDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('考勤记录ID不存在')
    router.push('/dashboard')
    return
  }
  
  loading.value = true
  try {
    // TODO: 实现获取单个考勤记录的API
    // 由于还没有实现，这里使用模拟数据
    setTimeout(() => {
      attendance.value = {
        id: parseInt(id),
        memberId: 1,
        userId: 1,
        userName: '测试用户',
        projectId: 1,
        projectName: '测试项目',
        attendanceDate: '2023-07-10',
        checkInTime: '08:30:00',
        checkOutTime: '17:30:00',
        status: AttendanceStatus.NORMAL,
        statusDesc: '正常',
        workHours: 9,
        location: '上海市浦东新区张江高科技园区',
        remarks: '工作顺利',
        createTime: '2023-07-10 08:30:00'
      }
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('加载考勤详情失败:', error)
    ElMessage.error('加载考勤详情失败')
    loading.value = false
  }
}

// 处理编辑按钮点击
const handleEdit = () => {
  if (!attendance.value) return
  
  editForm.id = attendance.value.id
  editForm.checkInTime = attendance.value.checkInTime
  editForm.checkOutTime = attendance.value.checkOutTime || ''
  editForm.status = attendance.value.status
  editForm.workHours = attendance.value.workHours || undefined
  editForm.remarks = attendance.value.remarks || ''
  
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
    loadAttendanceDetail()
  } catch (error) {
    console.error('更新考勤记录失败:', error)
    ElMessage.error('更新考勤记录失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAttendanceDetail()
})
</script>

<style scoped>
.attendance-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-bar {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 