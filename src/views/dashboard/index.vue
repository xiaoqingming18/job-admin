<script setup lang="ts">
import { ref } from 'vue'
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
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    // TODO: 实现登出逻辑
    router.push('/login')
  }
}

// 菜单配置
const menuItems = [
  {
    icon: 'HomeFilled',
    title: '首页',
    index: '/dashboard'
  },
  {
    icon: 'Office',
    title: '企业管理',
    index: '/dashboard/companies'
  },
  {
    icon: 'Briefcase',
    title: '项目管理',
    index: '/dashboard/projects'
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
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
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
              管理员 <el-icon><arrow-down /></el-icon>
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
  background-color: #304156;
  transition: width 0.3s;
  overflow-y: auto;
}

.dashboard-container.is-collapsed .sidebar {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #263445;
}

.logo-container h2 {
  margin: 0;
  font-size: 18px;
}

.sidebar-menu {
  border-right: none;
  background-color: #304156;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #409EFF;
  background-color: #263445;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
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
