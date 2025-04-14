<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const overviewData = ref({
  totalCompanies: 0,
  totalProjects: 0,
  totalJobs: 0,
  totalUsers: 0
})

const latestJobs = ref([])
const isLoading = ref(true)

onMounted(() => {
  // Simulating API call
  setTimeout(() => {
    // Mock data for demonstration
    overviewData.value = {
      totalCompanies: 256,
      totalProjects: 145,
      totalJobs: 432,
      totalUsers: 1240
    }
    
    latestJobs.value = [
      { id: 1, title: '建筑工程师', company: '某某建筑公司', location: '北京', salary: '15k-25k', created_at: '2025-04-10' },
      { id: 2, title: '电气工程师', company: '某某工程公司', location: '上海', salary: '20k-30k', created_at: '2025-04-12' },
      { id: 3, title: '工程监理', company: '某某监理公司', location: '广州', salary: '18k-28k', created_at: '2025-04-13' },
      { id: 4, title: '安全员', company: '某某建筑集团', location: '深圳', salary: '12k-18k', created_at: '2025-04-14' },
      { id: 5, title: '土木工程师', company: '某某工程有限公司', location: '杭州', salary: '15k-22k', created_at: '2025-04-15' }
    ]
    
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="dashboard-home">
    <el-card class="welcome-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>欢迎使用建筑行业劳务中介平台管理系统</h3>
          <p>{{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </template>
      <div class="card-content">
        <p>本系统用于管理建筑行业劳务中介平台的各项业务，包括企业管理、项目管理、职位管理等功能。</p>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-item">
            <el-icon class="overview-icon"><Office /></el-icon>
            <div class="overview-info">
              <div class="overview-title">企业总数</div>
              <div class="overview-value" v-loading="isLoading">{{ overviewData.totalCompanies }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-item">
            <el-icon class="overview-icon"><Briefcase /></el-icon>
            <div class="overview-info">
              <div class="overview-title">项目总数</div>
              <div class="overview-value" v-loading="isLoading">{{ overviewData.totalProjects }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-item">
            <el-icon class="overview-icon"><Suitcase /></el-icon>
            <div class="overview-info">
              <div class="overview-title">职位总数</div>
              <div class="overview-value" v-loading="isLoading">{{ overviewData.totalJobs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-item">
            <el-icon class="overview-icon"><User /></el-icon>
            <div class="overview-info">
              <div class="overview-title">用户总数</div>
              <div class="overview-value" v-loading="isLoading">{{ overviewData.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="latest-jobs" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>最近发布的职位</h3>
        </div>
      </template>
      <el-table :data="latestJobs" v-loading="isLoading" style="width: 100%">
        <el-table-column prop="title" label="职位名称" />
        <el-table-column prop="company" label="公司名称" />
        <el-table-column prop="location" label="工作地点" />
        <el-table-column prop="salary" label="薪资范围" />
        <el-table-column prop="created_at" label="发布日期" />
        <el-table-column label="操作">
          <template #default>
            <el-button type="primary" size="small" link>查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.data-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.overview-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.overview-icon {
  font-size: 48px;
  margin-right: 16px;
  color: #409EFF;
}

.overview-info {
  display: flex;
  flex-direction: column;
}

.overview-title {
  font-size: 14px;
  color: #909399;
}

.overview-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-top: 8px;
}

.latest-jobs {
  margin-bottom: 20px;
}
</style>
