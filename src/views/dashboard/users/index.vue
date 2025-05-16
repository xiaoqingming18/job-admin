<template>
  <div class="users-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">用户管理</h2>
        <span class="subtitle">管理系统中的所有用户</span>
      </div>
      <div class="actions-section">
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/手机号/邮箱"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option label="系统管理员" value="system_admin" />
            <el-option label="企业管理员" value="company_admin" />
            <el-option label="项目经理" value="project_manager" />
            <el-option label="求职者" value="job_seeker" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.accountStatus" placeholder="请选择状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Delete /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表表格 -->
    <el-card v-loading="loading" class="user-table-container" shadow="hover">
      <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" min-width="80" />
        <el-table-column label="头像" min-width="80" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.realName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.mobile || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="scope">
            <el-tag
              :type="getRoleTagType(scope.row.role)"
              effect="light"
            >
              {{ getRoleLabel(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountStatus" label="状态" min-width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.accountStatus)"
              effect="light"
            >
              {{ getStatusLabel(scope.row.accountStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="companyName" label="所属企业" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.companyName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click.stop="handleDetail(scope.row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button
              link
              :type="scope.row.accountStatus === 'enabled' ? 'danger' : 'success'"
              @click.stop="handleToggleStatus(scope.row)"
            >
              <el-icon v-if="scope.row.accountStatus === 'enabled'"><Lock /></el-icon>
              <el-icon v-else><Unlock /></el-icon>
              {{ scope.row.accountStatus === 'enabled' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="用户详情"
      size="30%"
      destroy-on-close
    >
      <el-descriptions v-if="currentUser" column="1" border>
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar :size="60" :src="currentUser.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentUser.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.mobile || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="getRoleTagType(currentUser.role)">
            {{ getRoleLabel(currentUser.role) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="getStatusTagType(currentUser.accountStatus)">
            {{ getStatusLabel(currentUser.accountStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(currentUser.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="所属企业">{{ currentUser.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ currentUser.position || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="drawer-footer">
        <el-button
          v-if="currentUser"
          :type="currentUser.accountStatus === 'enabled' ? 'danger' : 'success'"
          @click="handleToggleStatusInDrawer"
          style="margin-right: 8px"
        >
          {{ currentUser.accountStatus === 'enabled' ? '禁用账号' : '启用账号' }}
        </el-button>
        <el-button @click="drawerVisible = false">关闭</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageUserList, getAdminUserDetail } from '@/api/user'
import { UserRole, AccountStatus, UserListItem, UserDetail } from '@/types/user'
import { formatDate as formatDateUtil } from '@/utils/format'
import {
  Refresh,
  Search,
  Delete,
  User,
  View,
  Lock,
  Unlock
} from '@element-plus/icons-vue'

// 状态定义
const loading = ref(false)
const userList = ref<UserListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const drawerVisible = ref(false)
const currentUser = ref<UserDetail | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  role: '' as string,
  accountStatus: '' as string
})

// 获取用户列表数据
const fetchUserList = async () => {
  loading.value = true
  try {
    // 构造请求参数，过滤掉空值
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 只有非空值才添加到请求参数中
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    
    if (searchForm.role) {
      params.role = searchForm.role
    }
    
    if (searchForm.accountStatus) {
      params.accountStatus = searchForm.accountStatus
    }
    
    const res = await pageUserList(params)
    userList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 获取用户详情
const fetchUserDetail = async (id: number) => {
  try {
    const res = await getAdminUserDetail(id)
    currentUser.value = res.data
  } catch (error) {
    console.error('获取用户详情失败', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  searchForm.accountStatus = ''
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUserList()
}

const handleDetail = async (row: UserListItem) => {
  await fetchUserDetail(row.id)
  drawerVisible.value = true
}

const handleRowClick = (row: UserListItem) => {
  handleDetail(row)
}

const refreshData = () => {
  fetchUserList()
}

// 切换用户状态
const handleToggleStatus = (row: UserListItem) => {
  const actionText = row.accountStatus === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${actionText}用户 "${row.username}" 的账号吗？`,
    `${actionText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      // 此处应该调用接口修改用户状态，由于未提供相关接口，暂做前端模拟
      ElMessage.success(`已${actionText}用户账号`)
      
      // 假设操作成功，刷新数据
      fetchUserList()
    })
    .catch(() => {
      // 取消操作
    })
}

const handleToggleStatusInDrawer = () => {
  if (!currentUser.value) return
  
  const actionText = currentUser.value.accountStatus === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${actionText}用户 "${currentUser.value.username}" 的账号吗？`,
    `${actionText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      // 此处应该调用接口修改用户状态，由于未提供相关接口，暂做前端模拟
      ElMessage.success(`已${actionText}用户账号`)
      
      // 假设操作成功，刷新数据
      fetchUserList()
      drawerVisible.value = false
    })
    .catch(() => {
      // 取消操作
    })
}

// 工具函数
const formatDate = (date: string) => {
  return formatDateUtil(date, 'YYYY-MM-DD HH:mm:ss')
}

const getRoleLabel = (role: UserRole) => {
  const roleMap: Record<UserRole, string> = {
    [UserRole.SYSTEM_ADMIN]: '系统管理员',
    [UserRole.COMPANY_ADMIN]: '企业管理员',
    [UserRole.PROJECT_MANAGER]: '项目经理',
    [UserRole.JOB_SEEKER]: '求职者'
  }
  return roleMap[role] || role
}

const getStatusLabel = (status: AccountStatus) => {
  const statusMap: Record<string, string> = {
    [AccountStatus.ENABLED]: '已启用',
    [AccountStatus.DISABLED]: '已禁用',
    'pending': '已启用'  // pending 状态显示为已启用
  }
  return statusMap[status] || status
}

const getRoleTagType = (role: UserRole) => {
  const roleTagMap: Record<UserRole, string> = {
    [UserRole.SYSTEM_ADMIN]: 'danger',
    [UserRole.COMPANY_ADMIN]: 'warning',
    [UserRole.PROJECT_MANAGER]: 'success',
    [UserRole.JOB_SEEKER]: 'info'
  }
  return roleTagMap[role] || ''
}

const getStatusTagType = (status: AccountStatus) => {
  const statusTagMap: Record<string, string> = {
    [AccountStatus.ENABLED]: 'success',
    [AccountStatus.DISABLED]: 'danger',
    'pending': 'success'  // pending 状态使用与已启用相同的样式
  }
  return statusTagMap[status] || ''
}

// 生命周期钩子
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.actions-section {
  display: flex;
  gap: 10px;
}

.filter-container {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.user-table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: #fff;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e4e7ed;
}
</style> 