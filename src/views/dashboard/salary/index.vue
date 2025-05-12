<template>
  <div class="salary-list-container">
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <el-form :model="queryParams" inline>
          <el-form-item label="项目">
            <el-select
              v-model="queryParams.projectId"
              clearable
              placeholder="选择项目"
              style="width: 240px"
            >
              <el-option
                v-for="item in projectOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年份">
            <el-select
              v-model="queryParams.year"
              clearable
              placeholder="选择年份"
              style="width: 120px"
            >
              <el-option
                v-for="item in yearOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="月份">
            <el-select
              v-model="queryParams.month"
              clearable
              placeholder="选择月份"
              style="width: 120px"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              clearable
              placeholder="选择状态"
              style="width: 120px"
            >
              <el-option
                v-for="(label, value) in salaryStatusMap"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="工人姓名">
            <el-input
              v-model="queryParams.userName"
              clearable
              placeholder="工人姓名"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="工号">
            <el-input
              v-model="queryParams.attendanceCode"
              clearable
              placeholder="工号"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-button
            type="primary"
            @click="openGenerateSalaryDialog"
          >生成工资单</el-button>
          <div class="right-buttons">
            <el-button
              type="success"
              :disabled="!selectedRows.length"
              @click="handleBatchConfirm"
            >批量确认</el-button>
            <el-button
              type="info"
              :disabled="!selectedRows.length"
              @click="handleBatchPay"
            >批量标记已发放</el-button>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="工人姓名" prop="userName" min-width="100" />
        <el-table-column label="工号" prop="attendanceCode" min-width="100" />
        <el-table-column label="项目名称" prop="projectName" min-width="150" />
        <el-table-column label="年月">
          <template #default="{ row }">
            {{ `${row.year}年${row.month}月` }}
          </template>
        </el-table-column>
        <el-table-column label="工作天数" prop="workDays" min-width="90" />
        <el-table-column label="基本工资" prop="basicSalary" min-width="120">
          <template #default="{ row }">
            ¥ {{ row.basicSalary.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="加班费" prop="overtimePay" min-width="120">
          <template #default="{ row }">
            ¥ {{ row.overtimePay.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="总金额" prop="totalAmount" min-width="120">
          <template #default="{ row }">
            <span class="total-amount">¥ {{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" min-width="100">
          <template #default="{ row }">
            <el-tag :type="salaryStatusTypeMap[row.status]">
              {{ salaryStatusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetail(row)"
            >查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleConfirm(row)"
            >确认</el-button>
            <el-button
              v-if="row.status === 'confirmed'"
              type="info"
              link
              @click="handlePay(row)"
            >标记已发放</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 生成工资单对话框 -->
    <el-dialog
      v-model="generateSalaryDialogVisible"
      title="生成工资单"
      width="500px"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateFormRules"
        label-width="80px"
      >
        <el-form-item label="项目" prop="projectId">
          <el-select
            v-model="generateForm.projectId"
            placeholder="选择项目"
            style="width: 100%"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-select
            v-model="generateForm.year"
            placeholder="选择年份"
            style="width: 100%"
          >
            <el-option
              v-for="item in yearOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <el-select
            v-model="generateForm.month"
            placeholder="选择月份"
            style="width: 100%"
          >
            <el-option
              v-for="item in monthOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="generateSalaryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGenerateSalary">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  generateSalary,
  getSalaryList,
  confirmSalary,
  paySalary,
  batchConfirmSalary,
  batchPaySalary,
  salaryStatusMap,
  salaryStatusTypeMap
} from '@/api/salary'
import { getProjectList, getCompanyAllProjects, getManagerProjectList } from '@/api/project'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const selectedRows = ref<any[]>([])
const generateSalaryDialogVisible = ref(false)
const generateFormRef = ref()

// 项目选项
const projectOptions = ref<{ label: string; value: number }[]>([])

// 年份选项
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  return Array.from({ length: 5 }, (_, i) => ({
    label: `${currentYear - i}年`,
    value: currentYear - i
  }))
})

// 月份选项
const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}月`,
    value: i + 1
  }))
})

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  projectId: undefined,
  year: undefined,
  month: undefined,
  status: undefined,
  userName: undefined,
  attendanceCode: undefined
})

// 生成工资单表单
const generateForm = reactive({
  projectId: undefined,
  year: currentYear,
  month: new Date().getMonth() + 1
})

// 生成工资单表单校验规则
const generateFormRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }]
}

// 初始化
onMounted(async () => {
  await loadProjects()
  fetchSalaryList()
})

// 加载项目列表
const loadProjects = async () => {
  try {
    let projects = [];
    
    // 根据用户角色获取不同的项目列表
    if (userStore.isAdmin) {
      // 管理员可以看到所有项目
      const res = await getProjectList({
        current: 1,
        size: 100
      });
      if (res.code === 0 && res.data && res.data.records) {
        projects = res.data.records;
      }
    } else if (userStore.isCompanyAdmin) {
      // 企业管理员只能看到自己公司的项目
      const companyId = userStore.userInfo?.companyId;
      if (companyId) {
        const res = await getCompanyAllProjects(companyId);
        if (res.code === 0 && res.data) {
          projects = res.data.records || res.data;
        }
      }
    } else if (userStore.isProjectManager) {
      // 项目经理只能看到自己管理的项目
      const managerId = userStore.userInfo?.id;
      if (managerId) {
        const res = await getManagerProjectList(managerId);
        if (res.code === 0 && res.data) {
          projects = res.data.projects || res.data;
        }
      }
    }
    
    // 转换为选项格式
    projectOptions.value = projects.map((item: any) => ({
      label: item.name,
      value: item.id
    }));
  } catch (error) {
    console.error('加载项目列表失败:', error);
  }
}

// 获取工资列表
const fetchSalaryList = async () => {
  loading.value = true
  try {
    const res = await getSalaryList(queryParams)
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取工资列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理多选变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.size = size
  fetchSalaryList()
}

// 处理当前页变化
const handleCurrentChange = (current: number) => {
  queryParams.current = current
  fetchSalaryList()
}

// 处理搜索
const handleSearch = () => {
  queryParams.current = 1
  fetchSalaryList()
}

// 重置查询条件
const resetQuery = () => {
  Object.keys(queryParams).forEach(key => {
    if (key !== 'current' && key !== 'size') {
      queryParams[key] = undefined
    }
  })
  queryParams.current = 1
  fetchSalaryList()
}

// 打开生成工资单对话框
const openGenerateSalaryDialog = () => {
  generateForm.projectId = undefined
  generateForm.year = currentYear
  generateForm.month = new Date().getMonth() + 1
  generateSalaryDialogVisible.value = true
}

// 生成工资单
const handleGenerateSalary = async () => {
  if (!generateFormRef.value) return
  
  await generateFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      const res = await generateSalary(generateForm)
      if (res.code === 0) {
        ElMessage.success(`成功生成 ${res.data} 条工资记录`)
        generateSalaryDialogVisible.value = false
        fetchSalaryList()
      }
    } catch (error) {
      console.error('生成工资单失败:', error)
    }
  })
}

// 查看工资详情
const handleViewDetail = (row: any) => {
  router.push(`/dashboard/salary/detail/${row.id}`)
}

// 确认工资单
const handleConfirm = async (row: any) => {
  try {
    await confirmSalary(row.id)
    ElMessage.success('工资单确认成功')
    fetchSalaryList()
  } catch (error) {
    console.error('确认工资单失败:', error)
  }
}

// 标记工资已发放
const handlePay = async (row: any) => {
  try {
    await paySalary(row.id)
    ElMessage.success('工资已标记为发放')
    fetchSalaryList()
  } catch (error) {
    console.error('标记工资已发放失败:', error)
  }
}

// 批量确认工资单
const handleBatchConfirm = async () => {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请选择要确认的工资单')
  }
  
  // 过滤出待确认状态的工资单
  const pendingIds = selectedRows.value
    .filter(row => row.status === 'pending')
    .map(row => row.id)
  
  if (pendingIds.length === 0) {
    return ElMessage.warning('选中的工资单中没有待确认状态的记录')
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量确认 ${pendingIds.length} 条工资单吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await batchConfirmSalary(pendingIds)
    ElMessage.success(`成功确认 ${res.data} 条工资单`)
    fetchSalaryList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量确认工资单失败:', error)
    }
  }
}

// 批量标记工资已发放
const handleBatchPay = async () => {
  if (selectedRows.value.length === 0) {
    return ElMessage.warning('请选择要标记的工资单')
  }
  
  // 过滤出已确认状态的工资单
  const confirmedIds = selectedRows.value
    .filter(row => row.status === 'confirmed')
    .map(row => row.id)
  
  if (confirmedIds.length === 0) {
    return ElMessage.warning('选中的工资单中没有已确认状态的记录')
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量标记 ${confirmedIds.length} 条工资单为已发放吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await batchPaySalary(confirmedIds)
    ElMessage.success(`成功标记 ${res.data} 条工资单为已发放`)
    fetchSalaryList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量标记工资已发放失败:', error)
    }
  }
}
</script>

<style scoped>
.salary-list-container {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.right-buttons {
  display: flex;
  gap: 8px;
}

.total-amount {
  font-weight: bold;
  color: #409eff;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: end;
}
</style> 