<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeFilled,
  Office,
  Briefcase,
  Suitcase,
  User,
  Setting,
  Expand,
  Fold,
  ArrowDown,
  Tools,
  Document,
  Calendar,
  ChatDotRound
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    // 使用Pinia仓库处理注销
    userStore.logout()
    router.push('/login')
  }
}

// 基础菜单配置
const baseMenuItems = [
  {
    icon: 'HomeFilled',
    title: '首页',
    index: '/dashboard'
  },
  {
    icon: 'Office',
    title: '企业管理',
    index: '/dashboard/companies',
    adminOnly: true // 标记为仅管理员可见
  },
  {
    icon: 'Briefcase',
    title: '项目管理',
    index: '/dashboard/projects'
  },
  {
    icon: 'User',
    title: '项目成员管理',
    index: '/dashboard/project-members'
  },
  {
    icon: 'User',
    title: '项目经理管理',
    index: '/dashboard/managers',
    companyAdminOnly: true // 标记为仅企业管理员可见
  },
  {
    icon: 'Tools',
    title: '工种管理',
    index: '/dashboard/occupations',
    adminOnly: true // 标记为仅管理员可见
  },
  {
    icon: 'Suitcase',
    title: '劳务需求管理',
    index: '/dashboard/labor-demands'
  },
  {
    icon: 'Document',
    title: '求职申请管理',
    index: '/dashboard/job-applications',
    managerOnly: true // 标记为仅项目经理可见
  },
  {
    icon: 'Calendar',
    title: '面试管理',
    index: '/dashboard/interviews',
    managerOnly: true // 标记为仅项目经理可见
  },
  {
    icon: 'Calendar',
    title: '考勤相关',
    index: '/dashboard/attendance-menu',
    children: [
      {
        title: '考勤管理',
        index: '/dashboard/attendance'
      },
      {
        title: '请假管理',
        index: '/dashboard/leave'
      }
    ]
  },
  {
    icon: 'ChatDotRound',
    title: '即时通讯',
    index: '/dashboard/chat',
    managerOnly: true // 标记为仅项目经理可见
  },
  {
    icon: 'Document',
    title: '合同管理',
    index: '/dashboard/contracts',
    children: [
      {
        title: '合同模板管理',
        index: '/dashboard/contract-templates',
        companyAdminOnly: true // 标记为仅企业管理员可见
      },
      {
        title: '劳务合同管理',
        index: '/dashboard/labor-contracts'
      },
      {
        title: '签约与续签',
        index: '/dashboard/contract-signing',
        managerOnly: true // 标记为仅项目经理可见
      }
    ]
  },
  {
    icon: 'Suitcase',
    title: '职位管理',
    index: '/dashboard/jobs'
  },
  {
    icon: 'User',
    title: '用户管理',
    index: '/dashboard/users'
  },
  {
    icon: 'Setting',
    title: '系统设置',
    index: '/dashboard/settings'
  }
]

// 检查菜单项是否有权限显示
const checkMenuItemPermission = (item: any) => {
  // 如果菜单项标记为仅管理员可见，则只在用户角色为SYSTEM_ADMIN时显示
  if (item.adminOnly) {
    return userStore.isAdmin
  }
  // 如果菜单项标记为仅企业管理员可见，则只在用户角色为COMPANY_ADMIN时显示
  if (item.companyAdminOnly) {
    return userStore.isCompanyAdmin
  }
  // 如果菜单项标记为仅项目经理可见，则只在用户角色为PROJECT_MANAGER时显示
  if (item.managerOnly) {
    return userStore.isProjectManager
  }
  return true
}

// 根据用户角色过滤菜单项
const menuItems = computed(() => {
  return baseMenuItems.filter(item => checkMenuItemPermission(item))
})

// 获取某个父菜单项下可见的子菜单项
const getVisibleChildren = (item: any) => {
  if (!item.children) return []
  return item.children.filter(child => checkMenuItemPermission(child))
}
</script>

<template>
  <div class="dashboard-container" :class="{ 'is-collapsed': isCollapse }">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <h2 v-if="!isCollapse">劳务管理系统</h2>
        <h2 v-else>LMS</h2>
      </div>
      
      <el-menu
        default-active="/dashboard"
        class="sidebar-menu"
        :collapse="isCollapse"
        :unique-opened="true"
        :router="true"
      >
        <template v-for="item in menuItems" :key="item.index">
          <!-- 有子菜单的菜单项 -->
          <el-sub-menu v-if="item.children" :index="item.index">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item 
              v-for="child in getVisibleChildren(item)" 
              :key="child.index" 
              :index="child.index"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 没有子菜单的菜单项 -->
          <el-menu-item v-else :index="item.index">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="header">
        <div class="left-section">
          <el-button type="text" @click="toggleSidebar">
            <el-icon :size="24">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>管理中心</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="right-section">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown-link">
              {{ userStore.username }} <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">账号设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  height: 100%;
  background-color: #ffffff;
  transition: width 0.3s;
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-container.is-collapsed .sidebar {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a5cff;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f2f5;
}

.logo-container h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border-right: none;
  background-color: #ffffff;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #606266;
  height: 50px;
  line-height: 50px;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  color: #303133;
  height: 50px;
  line-height: 50px;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #1a5cff;
  background-color: #e6f0ff;
  border-right: 3px solid #1a5cff;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #f5f7fa;
}

.sidebar-menu :deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #1a5cff;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  background-color: #fff;
}

.left-section {
  display: flex;
  align-items: center;
}

.breadcrumb {
  margin-left: 20px;
}

.user-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7f9;
}
</style>
