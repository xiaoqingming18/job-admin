<template>
  <el-dialog
    title="项目成员详情"
    v-model="dialogVisible"
    width="600px"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="成员ID">{{ memberInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ memberInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ memberInfo.mobile || '无' }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ memberInfo.projectName }}</el-descriptions-item>
        <el-descriptions-item label="工种">{{ memberInfo.jobTypeName }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ memberInfo.position }}</el-descriptions-item>
        <el-descriptions-item label="日薪">{{ memberInfo.dailyWage }} 元</el-descriptions-item>
        <el-descriptions-item label="入场日期">{{ memberInfo.joinDate }}</el-descriptions-item>
        <el-descriptions-item label="计划离场日期">{{ memberInfo.plannedEndDate || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="实际离场日期">{{ memberInfo.actualEndDate || '未离场' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(memberInfo.status)">
            {{ memberInfo.statusDesc }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="考勤编号">{{ memberInfo.attendanceCode || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ memberInfo.emergencyContact || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系电话">{{ memberInfo.emergencyPhone || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ memberInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ memberInfo.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ memberInfo.remarks || '无' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="primary" @click="handleEdit">编辑</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getProjectMemberInfo } from '@/api/projectMember'
import type { ProjectMember } from '@/types/projectMember'

interface Props {
  visible: boolean
  memberId?: number
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'edit', memberId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 加载状态
const loading = ref(false)

// 成员详情
const memberInfo = ref<ProjectMember>({} as ProjectMember)

// 监听对话框打开
watch(() => props.visible, async (val) => {
  if (val && props.memberId) {
    await loadMemberInfo(props.memberId)
  }
})

// 加载成员详情
const loadMemberInfo = async (id: number) => {
  loading.value = true
  try {
    const res = await getProjectMemberInfo(id)
    memberInfo.value = res.data
  } catch (error) {
    console.error('加载成员详情失败:', error)
    ElMessage.error('加载成员详情失败')
    dialogVisible.value = false
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'inactive':
      return 'info'
    case 'left':
      return 'danger'
    default:
      return 'info'
  }
}

// 处理编辑按钮点击
const handleEdit = () => {
  if (props.memberId) {
    emit('edit', props.memberId)
    dialogVisible.value = false
  }
}
</script> 