<template>
  <div class="certificate-verification-container">
    <div class="header">
      <div class="title">证书审核管理</div>
      
      <div class="search-box">
        <el-select
          v-model="queryParams.status"
          placeholder="审核状态"
          clearable
          style="width: 150px; margin-right: 15px;"
        >
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="verified" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="certificateList"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="jobSeekerName" label="求职者" width="120" />
      <el-table-column prop="certificateName" label="证书名称" min-width="150" />
      <el-table-column prop="certificateNo" label="证书编号" width="150" />
      <el-table-column prop="certificateTypeName" label="证书类型" width="120" />
      <el-table-column label="证书图片" width="120" align="center">
        <template #default="scope">
          <el-image
            v-if="scope.row.imageUrl"
            :src="scope.row.imageUrl"
            style="width: 80px; height: 50px; object-fit: cover;"
            :preview-src-list="[scope.row.imageUrl]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.verificationStatus)">
            {{ getStatusText(scope.row.verificationStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.verificationStatus === 'pending'"
            type="primary"
            link
            size="small"
            @click="handleVerify(scope.row)"
          >
            审核
          </el-button>
          <el-button
            type="info"
            link
            size="small"
            @click="handleViewDetail(scope.row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
      title="证书详情"
      v-model="detailDialogVisible"
      width="700px"
    >
      <div v-if="currentCertificate" class="certificate-detail">
        <div class="detail-row">
          <div class="label">求职者：</div>
          <div class="value">{{ currentCertificate.jobSeekerName }}</div>
        </div>
        <div class="detail-row">
          <div class="label">证书名称：</div>
          <div class="value">{{ currentCertificate.certificateName }}</div>
        </div>
        <div class="detail-row">
          <div class="label">证书编号：</div>
          <div class="value">{{ currentCertificate.certificateNo || '-' }}</div>
        </div>
        <div class="detail-row">
          <div class="label">证书类型：</div>
          <div class="value">{{ currentCertificate.certificateTypeName || '-' }}</div>
        </div>
        <div class="detail-row">
          <div class="label">发证日期：</div>
          <div class="value">{{ formatDate(currentCertificate.issueDate) || '-' }}</div>
        </div>
        <div class="detail-row">
          <div class="label">有效期至：</div>
          <div class="value">{{ formatDate(currentCertificate.expiryDate) || '-' }}</div>
        </div>
        <div class="detail-row">
          <div class="label">审核状态：</div>
          <div class="value">
            <el-tag :type="getStatusType(currentCertificate.verificationStatus)">
              {{ getStatusText(currentCertificate.verificationStatus) }}
            </el-tag>
          </div>
        </div>
        <div class="detail-row">
          <div class="label">提交时间：</div>
          <div class="value">{{ formatDateTime(currentCertificate.createTime) }}</div>
        </div>
        <div class="detail-row">
          <div class="label">最后更新：</div>
          <div class="value">{{ formatDateTime(currentCertificate.updateTime) }}</div>
        </div>
        
        <div class="detail-row">
          <div class="label">证书图片：</div>
        </div>
        <div class="image-container">
          <el-image
            v-if="currentCertificate.imageUrl"
            :src="currentCertificate.imageUrl"
            style="max-width: 100%; max-height: 400px;"
            :preview-src-list="[currentCertificate.imageUrl]"
          />
          <el-empty v-else description="暂无图片" />
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      title="证书审核"
      v-model="verifyDialogVisible"
      width="700px"
      @closed="resetVerifyForm"
    >
      <div v-if="currentCertificate" class="certificate-verify">
        <div class="certificate-info">
          <div class="info-row">
            <span class="label">求职者：</span>
            <span class="value">{{ currentCertificate.jobSeekerName }}</span>
          </div>
          <div class="info-row">
            <span class="label">证书名称：</span>
            <span class="value">{{ currentCertificate.certificateName }}</span>
          </div>
          <div class="info-row">
            <span class="label">证书编号：</span>
            <span class="value">{{ currentCertificate.certificateNo || '-' }}</span>
          </div>
        </div>
        
        <div class="image-container">
          <el-image
            v-if="currentCertificate.imageUrl"
            :src="currentCertificate.imageUrl"
            style="max-width: 100%; max-height: 300px;"
            :preview-src-list="[currentCertificate.imageUrl]"
          />
          <el-empty v-else description="暂无图片" />
        </div>
        
        <el-form
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyRules"
          label-width="100px"
          style="margin-top: 20px;"
        >
          <el-form-item label="审核结果" prop="status">
            <el-radio-group v-model="verifyForm.status">
              <el-radio label="verified">通过</el-radio>
              <el-radio label="rejected">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="审核备注" prop="comment" v-if="verifyForm.status === 'rejected'">
            <el-input
              v-model="verifyForm.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入拒绝原因，将会通知给申请人"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">确认审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getCertificateVerificationList, 
  getCertificateVerificationDetail, 
  verifyCertificate 
} from '@/api/certificate'

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(/\//g, '-')
}

// 只格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\//g, '-')
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'verified': return 'success'
    case 'rejected': return 'danger'
    case 'pending': return 'warning'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'verified': return '已通过'
    case 'rejected': return '已拒绝'
    case 'pending': return '待审核'
    default: return '未知'
  }
}

// 数据列表
const certificateList = ref([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  status: ''
})

// 获取证书审核列表
const getCertificateList = async () => {
  loading.value = true
  try {
    const { data } = await getCertificateVerificationList(queryParams)
    certificateList.value = data.records
    total.value = data.total
  } catch (error) {
    console.error('获取证书审核列表失败', error)
    ElMessage.error('获取证书审核列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  queryParams.page = 1
  getCertificateList()
}

// 重置查询
const resetQuery = () => {
  queryParams.status = ''
  handleSearch()
}

// 页码变更处理
const handleSizeChange = (size) => {
  queryParams.size = size
  getCertificateList()
}

const handleCurrentChange = (page) => {
  queryParams.page = page
  getCertificateList()
}

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentCertificate = ref(null)

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const { data } = await getCertificateVerificationDetail(row.id)
    currentCertificate.value = data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取证书详情失败', error)
    ElMessage.error('获取证书详情失败')
  }
}

// 审核对话框相关
const verifyDialogVisible = ref(false)
const verifyFormRef = ref(null)
const verifyForm = reactive({
  status: 'verified',
  comment: ''
})

// 审核规则
const verifyRules = {
  status: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '拒绝时必须填写原因', trigger: 'blur' }
  ]
}

// 审核证书
const handleVerify = async (row) => {
  try {
    const { data } = await getCertificateVerificationDetail(row.id)
    currentCertificate.value = data
    resetVerifyForm()
    verifyDialogVisible.value = true
  } catch (error) {
    console.error('获取证书详情失败', error)
    ElMessage.error('获取证书详情失败')
  }
}

// 重置审核表单
const resetVerifyForm = () => {
  verifyForm.status = 'verified'
  verifyForm.comment = ''
  if (verifyFormRef.value) {
    verifyFormRef.value.resetFields()
  }
}

// 提交审核
const submitVerify = async () => {
  // 如果是拒绝，需要校验表单
  if (verifyForm.status === 'rejected') {
    verifyFormRef.value.validateField('comment', async (valid) => {
      if (!valid) return
      await doSubmitVerify()
    })
  } else {
    await doSubmitVerify()
  }
}

// 执行提交
const doSubmitVerify = async () => {
  try {
    await verifyCertificate(currentCertificate.value.id, {
      status: verifyForm.status,
      comment: verifyForm.comment
    })
    
    ElMessage.success(`证书审核${verifyForm.status === 'verified' ? '通过' : '拒绝'}成功`)
    verifyDialogVisible.value = false
    getCertificateList()
  } catch (error) {
    console.error('提交证书审核失败', error)
    ElMessage.error('提交证书审核失败')
  }
}

// 生命周期
onMounted(() => {
  getCertificateList()
})
</script>

<style scoped>
.certificate-verification-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.search-box {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.certificate-detail {
  padding: 10px;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
}

.detail-row .label {
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.detail-row .value {
  flex: 1;
}

.image-container {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.certificate-verify {
  padding: 10px;
}

.certificate-info {
  margin-bottom: 20px;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.info-row {
  margin-bottom: 10px;
}

.info-row .label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}
</style> 