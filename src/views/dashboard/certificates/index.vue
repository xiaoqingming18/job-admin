<template>
  <div class="certificates-container">
    <el-tabs v-model="activeName" class="certificate-tabs">
      <el-tab-pane label="证书类型管理" name="types">
        <certificate-types />
      </el-tab-pane>
      <el-tab-pane label="证书审核管理" name="verification">
        <certificate-verification />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CertificateTypes from './certificate-types.vue'
import CertificateVerification from './certificate-verification.vue'

const activeName = ref('types')
</script>

<style scoped>
.certificates-container {
  padding: 20px;
}

.certificate-tabs {
  margin-top: 10px;
}
</style> 