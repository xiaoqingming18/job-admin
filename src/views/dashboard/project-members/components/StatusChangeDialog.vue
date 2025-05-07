<template>
  <el-dialog
    title="更新成员状态"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="loading"
    >
      <el-form-item label="当前状态">
        <el-tag :type="getStatusType(currentStatus)">{{ currentStatusDesc }}</el-tag>
      </el-form-item>

      <el-form-item label="新状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="在职" value="active" />
          <el-option label="待入场" value="pending" />
          <el-option label="暂停工作" value="inactive" />
          <el-option label="已离场" value="left" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          placeholder="请输入状态变更原因或其他备注"
          rows="3"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { updateProjectMemberStatus, getProjectMemberInfo } from '@/api/projectMember'
import type { UpdateMemberStatusParams } from '@/types/projectMember'

interface Props {
  visible: boolean
  memberId?: number
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 加载状态
const loading = ref(false)

// 当前状态信息
const currentStatus = ref('')
const currentStatusDesc = ref('')

// 表单数据
const form = reactive<UpdateMemberStatusParams>({
  id: undefined,
  status: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 监听对话框打开
watch(() => props.visible, async (val) => {
  if (val && props.memberId) {
    // 加载成员当前状态
    await loadMemberStatus(props.memberId)
  }
})

// 加载成员状态
const loadMemberStatus = async (id: number) => {
  loading.value = true
  try {
    const res = await getProjectMemberInfo(id)
    const member = res.data
    
    // 设置当前状态
    currentStatus.value = member.status
    currentStatusDesc.value = member.statusDesc
    
    // 设置表单数据
    form.id = member.id
    form.status = member.status
  } catch (error) {
    console.error('加载成员状态失败:', error)
    ElMessage.error('加载成员状态失败')
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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 如果状态没有变化，提示用户
    if (form.status === currentStatus.value && !form.remarks) {
      ElMessage.warning('状态未发生变化，如需更新请添加备注')
      return
    }
    
    loading.value = true
    try {
      await updateProjectMemberStatus(form)
      ElMessage.success('状态更新成功')
      
      // 关闭对话框
      dialogVisible.value = false
      
      // 通知父组件刷新列表
      emit('success')
    } catch (error) {
      console.error('更新状态失败:', error)
      ElMessage.error('更新状态失败')
    } finally {
      loading.value = false
    }
  })
}
</script> 