<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      :disabled="loading"
    >
      <el-form-item label="项目" prop="projectId">
        <el-select
          v-model="form.projectId"
          placeholder="请选择项目"
          filterable
          :disabled="isEdit"
          style="width: 100%"
        >
          <el-option
            v-for="item in projects"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用户" prop="userId" v-if="!isEdit">
        <el-select
          v-model="form.userId"
          placeholder="请选择求职者"
          filterable
          remote
          :remote-method="remoteSearchUsers"
          :loading="userSearchLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in users"
            :key="item.id"
            :label="`${item.username}${item.realName ? ` (${item.realName})` : ''}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="工种" prop="jobTypeId" v-if="!isEdit">
        <el-select
          v-model="form.jobTypeId"
          placeholder="请选择工种"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in occupations"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="职位" prop="position">
        <el-input v-model="form.position" placeholder="请输入职位名称" />
      </el-form-item>

      <el-form-item label="日薪(元)" prop="dailyWage">
        <el-input-number
          v-model="form.dailyWage"
          :min="0"
          :precision="2"
          :step="10"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="入场日期" prop="joinDate">
        <el-date-picker
          v-model="form.joinDate"
          type="date"
          placeholder="选择入场日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="计划离场日期" prop="plannedEndDate">
        <el-date-picker
          v-model="form.plannedEndDate"
          type="date"
          placeholder="选择计划离场日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="实际离场日期" prop="actualEndDate" v-if="isEdit">
        <el-date-picker
          v-model="form.actualEndDate"
          type="date"
          placeholder="选择实际离场日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="在职" value="active" />
          <el-option label="待入场" value="pending" />
          <el-option label="暂停工作" value="inactive" />
          <el-option label="已离场" value="left" />
        </el-select>
      </el-form-item>

      <el-form-item label="考勤编号" prop="attendanceCode">
        <el-input v-model="form.attendanceCode" placeholder="请输入考勤编号" />
      </el-form-item>

      <el-form-item label="紧急联系人" prop="emergencyContact">
        <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人姓名" />
      </el-form-item>

      <el-form-item label="紧急联系电话" prop="emergencyPhone">
        <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系人电话" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          placeholder="请输入备注信息"
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
import { 
  addProjectMember, 
  updateProjectMember,
  getProjectMemberInfo 
} from '@/api/projectMember'
import { getProjectList, getCompanyAllProjects } from '@/api/project'
import { getAllOccupations } from '@/api/occupation'
import { searchJobseekers } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { 
  ProjectMember, 
  AddProjectMemberParams, 
  UpdateProjectMemberParams 
} from '@/types/projectMember'
import type { Project } from '@/types/project'
import type { Occupation } from '@/types/occupation'

interface User {
  id: number
  username: string
  realName: string | null
}

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

// 对话框标题
const title = computed(() => (props.memberId ? '编辑项目成员' : '添加项目成员'))
const isEdit = computed(() => !!props.memberId)

// 项目、工种和用户列表
const projects = ref<Project[]>([])
const occupations = ref<Occupation[]>([])
const users = ref<User[]>([])
const userSearchLoading = ref(false)

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 表单加载状态
const loading = ref(false)

// 表单数据
const form = reactive<AddProjectMemberParams | UpdateProjectMemberParams>({
  id: undefined,
  projectId: undefined,
  userId: undefined,
  jobTypeId: undefined,
  position: '',
  dailyWage: 0,
  joinDate: '',
  plannedEndDate: undefined,
  actualEndDate: undefined,
  status: 'pending',
  attendanceCode: '',
  emergencyContact: '',
  emergencyPhone: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  jobTypeId: [{ required: true, message: '请选择工种', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  dailyWage: [{ required: true, message: '请输入日薪', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入场日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 初始化用户仓库
const userStore = useUserStore()

// 监听对话框打开
watch(() => props.visible, async (val) => {
  if (val) {
    // 加载项目列表
    await loadProjects()
    
    // 加载工种列表
    await loadOccupations()
    
    // 如果是编辑模式，加载成员详情
    if (props.memberId) {
      await loadMemberInfo(props.memberId)
    }
  }
})

// 加载项目列表
const loadProjects = async () => {
  try {
    console.log('UserStore in loadProjects:', userStore);
    console.log('UserStore companyId:', userStore.userInfo?.companyId);
    
    if (userStore.isAdmin) {
      // 系统管理员加载所有项目（分页加载）
      let pageNum = 1;
      const pageSize = 100; // 最大限制为100
      let hasMore = true;
      let allProjects: Project[] = [];
      
      // 分批加载全部项目
      while (hasMore) {
        const res = await getProjectList({ pageNum, pageSize });
        allProjects = [...allProjects, ...res.data.list];
        
        // 检查是否还有更多数据
        if (res.data.list.length < pageSize || allProjects.length >= res.data.total) {
          hasMore = false;
        } else {
          pageNum++;
        }
      }
      
      projects.value = allProjects;
    } else if (userStore.userInfo?.companyId) {
      // 企业管理员或项目经理加载所属企业的项目
      const companyId = userStore.userInfo.companyId;
      console.log('Using companyId:', companyId);
      const res = await getCompanyAllProjects(companyId);
      projects.value = res.data;
    } else {
      ElMessage.warning('无法确定当前用户所属企业，无法加载项目列表');
    }
  } catch (error) {
    console.error('加载项目列表失败:', error);
    ElMessage.error('加载项目列表失败');
  }
}

// 加载工种列表
const loadOccupations = async () => {
  try {
    const res = await getAllOccupations();
    occupations.value = res.data;
  } catch (error) {
    console.error('加载工种列表失败:', error);
    ElMessage.error('加载工种列表失败');
  }
}

// 远程搜索用户
const remoteSearchUsers = async (query: string) => {
  if (query.length < 1) {
    users.value = []
    return
  }
  
  userSearchLoading.value = true
  try {
    const res = await searchJobseekers(query)
    if (res.code === 0) {
      users.value = res.data
    } else {
      ElMessage.warning(res.message || '搜索求职者失败')
      users.value = []
    }
  } catch (error) {
    console.error('搜索求职者失败:', error)
    ElMessage.error('搜索求职者失败')
    users.value = []
  } finally {
    userSearchLoading.value = false
  }
}

// 加载成员详情
const loadMemberInfo = async (id: number) => {
  loading.value = true
  try {
    const res = await getProjectMemberInfo(id)
    const member = res.data
    
    // 填充表单数据
    Object.assign(form, {
      id: member.id,
      projectId: member.projectId,
      position: member.position,
      dailyWage: member.dailyWage,
      joinDate: member.joinDate,
      plannedEndDate: member.plannedEndDate,
      actualEndDate: member.actualEndDate,
      status: member.status,
      attendanceCode: member.attendanceCode,
      emergencyContact: member.emergencyContact,
      emergencyPhone: member.emergencyPhone,
      remarks: member.remarks
    })
  } catch (error) {
    console.error('加载成员详情失败:', error)
    ElMessage.error('加载成员详情失败')
    dialogVisible.value = false
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      if (isEdit.value) {
        // 编辑模式
        await updateProjectMember(form as UpdateProjectMemberParams)
        ElMessage.success('更新成功')
      } else {
        // 添加模式
        await addProjectMember(form as AddProjectMemberParams)
        ElMessage.success('添加成功')
      }
      
      // 关闭对话框
      dialogVisible.value = false
      
      // 通知父组件刷新列表
      emit('success')
    } catch (error) {
      console.error(isEdit.value ? '更新成员失败:' : '添加成员失败:', error)
      ElMessage.error(isEdit.value ? '更新成员失败' : '添加成员失败')
    } finally {
      loading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置表单数据
  Object.assign(form, {
    id: undefined,
    projectId: undefined,
    userId: undefined,
    jobTypeId: undefined,
    position: '',
    dailyWage: 0,
    joinDate: '',
    plannedEndDate: undefined,
    actualEndDate: undefined,
    status: 'pending',
    attendanceCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    remarks: ''
  })
}
</script> 