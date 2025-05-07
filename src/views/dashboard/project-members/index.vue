<template>
  <div class="project-members-container">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>项目成员列表</span>
          <el-button 
            type="primary" 
            @click="handleAddClick"
          >
            添加项目成员
          </el-button>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="项目">
          <el-select v-model="queryParams.projectId" placeholder="选择项目" clearable filterable>
            <el-option
              v-for="item in projects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="职位">
          <el-input v-model="queryParams.position" placeholder="请输入职位" clearable />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
            <el-option label="在职" value="active" />
            <el-option label="待入场" value="pending" />
            <el-option label="暂停工作" value="inactive" />
            <el-option label="已离场" value="left" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="memberList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="projectName" label="项目名称" min-width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="mobile" label="手机号" width="120" />
        <el-table-column prop="jobTypeName" label="工种" width="100" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column prop="dailyWage" label="日薪(元)" width="100" />
        <el-table-column prop="joinDate" label="入场日期" width="110" />
        <el-table-column prop="plannedEndDate" label="计划离场日期" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              size="small" 
              link 
              type="primary" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              link 
              type="warning" 
              @click="handleStatus(scope.row)"
            >
              状态
            </el-button>
            <el-button 
              size="small" 
              link 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑项目成员对话框 -->
    <MemberFormDialog
      v-model:visible="formDialogVisible"
      :member-id="currentMemberId"
      @success="handleDialogSuccess"
    />

    <!-- 查看项目成员详情对话框 -->
    <MemberDetailDialog
      v-model:visible="detailDialogVisible"
      :member-id="currentMemberId"
      @edit="handleDetailEdit"
    />

    <!-- 更新成员状态对话框 -->
    <StatusChangeDialog
      v-model:visible="statusDialogVisible"
      :member-id="currentMemberId"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjectList, getCompanyAllProjects } from '@/api/project'
import { 
  getProjectMemberPage, 
  deleteProjectMember
} from '@/api/projectMember'
import type { ProjectMember, ProjectMemberQueryParams } from '@/types/projectMember'
import type { Project } from '@/types/project'
import { useUserStore } from '@/stores/user'
import MemberFormDialog from './components/MemberFormDialog.vue'
import MemberDetailDialog from './components/MemberDetailDialog.vue'
import StatusChangeDialog from './components/StatusChangeDialog.vue'

// 用户权限相关
const userStore = useUserStore()

// 项目列表
const projects = ref<Project[]>([])

// 查询参数
const queryParams = reactive<ProjectMemberQueryParams>({
  projectId: undefined,
  position: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 成员列表和分页数据
const memberList = ref<ProjectMember[]>([])
const total = ref(0)
const loading = ref(false)

// 对话框控制
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const currentMemberId = ref<number>()

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

// 加载项目列表
const loadProjects = async () => {
  try {
    // 根据用户角色决定加载哪些项目
    if (userStore.isAdmin) {
      // 系统管理员可查看所有项目 - 需要分页加载
      const pageSize = 100; // 最大限制为100
      let pageNum = 1;
      let hasMore = true;
      let allProjects: Project[] = [];
      
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
      // 企业管理员或项目经理使用新接口直接获取企业下的所有项目
      const companyId = userStore.userInfo.companyId;
      const res = await getCompanyAllProjects(companyId);
      
      if (userStore.isProjectManager) {
        // 项目经理只能看到自己管理的项目
        projects.value = res.data.filter(
          project => project.projectManagerId === userStore.userId
        );
      } else {
        // 企业管理员可以看到企业下所有项目
        projects.value = res.data;
      }
    } else {
      ElMessage.warning('无法确定当前用户所属企业，无法加载项目列表');
    }
  } catch (error) {
    console.error('加载项目列表失败:', error);
    ElMessage.error('加载项目列表失败');
  }
}

// 加载成员列表
const loadMemberList = async () => {
  loading.value = true
  try {
    const res = await getProjectMemberPage(queryParams)
    memberList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('加载项目成员列表失败:', error)
    ElMessage.error('加载项目成员列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索按钮点击
const handleSearch = () => {
  queryParams.pageNum = 1
  loadMemberList()
}

// 重置查询条件
const resetQuery = () => {
  queryParams.projectId = undefined
  queryParams.position = undefined
  queryParams.status = undefined
  queryParams.pageNum = 1
  loadMemberList()
}

// 处理添加按钮点击
const handleAddClick = () => {
  currentMemberId.value = undefined
  formDialogVisible.value = true
}

// 处理编辑按钮点击
const handleEdit = (row: ProjectMember) => {
  currentMemberId.value = row.id
  formDialogVisible.value = true
}

// 处理查看按钮点击
const handleView = (row: ProjectMember) => {
  currentMemberId.value = row.id
  detailDialogVisible.value = true
}

// 处理删除按钮点击
const handleDelete = (row: ProjectMember) => {
  ElMessageBox.confirm(
    `确定要删除该项目成员 ${row.username} (${row.position}) 吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteProjectMember(row.id)
      ElMessage.success('删除成功')
      loadMemberList()
    } catch (error) {
      console.error('删除项目成员失败:', error)
      ElMessage.error('删除项目成员失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理分页大小改变
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  loadMemberList()
}

// 处理当前页改变
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  loadMemberList()
}

// 对话框操作成功回调
const handleDialogSuccess = () => {
  loadMemberList()
}

// 详情对话框编辑按钮点击
const handleDetailEdit = (memberId: number) => {
  currentMemberId.value = memberId
  formDialogVisible.value = true
}

// 处理状态按钮点击
const handleStatus = (row: ProjectMember) => {
  currentMemberId.value = row.id
  statusDialogVisible.value = true
}

// 组件挂载时加载数据
onMounted(() => {
  loadProjects()
  loadMemberList()
})
</script>

<style scoped>
.project-members-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 