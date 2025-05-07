<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 获取用户仓库实例
const userStore = useUserStore()

// 当应用挂载时，初始化用户信息
onMounted(async () => {
  // 初始化用户信息（加载token并获取用户数据）
  const success = await userStore.init()
  
  if (success && userStore.userInfo) {
    // 在控制台输出用户信息
    console.log('=== 当前登录用户信息 ===')
    console.table(userStore.userInfo)
  }
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles will be placed here */
</style>
