import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types/user'

// 暂存用户仓库实例
let userStore: ReturnType<typeof useUserStore> | null = null

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/Login.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/login/Register.vue'),
      meta: {
        title: '企业注册',
        requiresAuth: false
      }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/login/ForgotPassword.vue'),
      meta: {
        title: '忘记密码',
        requiresAuth: false
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: {
        title: '管理中心',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: () => import('@/views/dashboard/home/index.vue'),
          meta: {
            title: '首页',
            requiresAuth: true
          }
        },
        {
          path: 'companies',
          name: 'companies',
          component: () => import('@/views/dashboard/companies/index.vue'),
          meta: {
            title: '企业管理',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'projects',
          name: 'projects',
          component: () => import('@/views/dashboard/projects/index.vue'),
          meta: {
            title: '项目管理',
            requiresAuth: true
          }
        },
        {
          path: 'project-members',
          name: 'project-members',
          component: () => import('@/views/dashboard/project-members/index.vue'),
          meta: {
            title: '项目成员管理',
            requiresAuth: true
          }
        },
        {
          path: 'occupations',
          name: 'Occupations',
          component: () => import('@/views/dashboard/occupations/index.vue'),
          meta: {
            title: '工种管理',
            requiresAuth: true,
            icon: 'el-icon-s-grid'
          }
        },
        {
          path: 'occupations/category',
          name: 'OccupationCategories',
          component: () => import('@/views/dashboard/occupations/category.vue'),
          meta: {
            title: '工种类别管理',
            requiresAuth: true,
            adminOnly: true,
            icon: 'el-icon-s-grid'
          }
        },
        {
          path: 'managers',
          name: 'managers',
          component: () => import('@/views/dashboard/managers/index.vue'),
          meta: {
            title: '项目经理管理',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'labor-demands',
          name: 'labor-demands',
          meta: {
            title: '劳务需求管理',
            requiresAuth: true
          },
          redirect: to => {
            // 获取用户仓库实例
            if (!userStore) {
              userStore = useUserStore()
            }
            
            // 根据用户角色重定向到不同的劳务需求管理页面
            if (userStore.isAdmin) {
              return { name: 'labor-demands-admin' }
            } else if (userStore.isCompanyAdmin) {
              return { name: 'labor-demands-company' }
            } else if (userStore.isProjectManager) {
              return { name: 'labor-demands-manager' }
            } else {
              return { name: 'dashboard-home' }
            }
          }
        },
        {
          path: 'labor-demands/admin',
          name: 'labor-demands-admin',
          component: () => import('@/views/dashboard/labor-demands/admin.vue'),
          meta: {
            title: '劳务需求管理 - 系统管理员',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'labor-demands/company',
          name: 'labor-demands-company',
          component: () => import('@/views/dashboard/labor-demands/company.vue'),
          meta: {
            title: '劳务需求管理 - 企业管理员',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'labor-demands/manager',
          name: 'labor-demands-manager',
          component: () => import('@/views/dashboard/labor-demands/manager.vue'),
          meta: {
            title: '劳务需求管理 - 项目经理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'job-applications',
          name: 'job-applications',
          component: () => import('@/views/dashboard/job-applications/index.vue'),
          meta: {
            title: '求职申请管理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'job-applications/:id',
          name: 'job-application-detail',
          component: () => import('@/views/dashboard/job-applications/detail.vue'),
          meta: {
            title: '求职申请详情',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'interviews',
          name: 'interviews',
          component: () => import('@/views/dashboard/interviews/index.vue'),
          meta: {
            title: '面试管理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'contract-templates',
          name: 'contract-templates',
          component: () => import('@/views/dashboard/contract-templates/index.vue'),
          meta: {
            title: '合同模板管理',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'labor-contracts',
          name: 'labor-contracts',
          component: () => import('@/views/dashboard/labor-contracts/index.vue'),
          meta: {
            title: '劳务合同管理',
            requiresAuth: true
          }
        },
        {
          path: 'labor-contracts/:id',
          name: 'labor-contract-detail',
          component: () => import('@/views/dashboard/labor-contracts/detail.vue'),
          meta: {
            title: '劳务合同详情',
            requiresAuth: true
          }
        },
        {
          path: 'contract-signing',
          name: 'contract-signing',
          component: () => import('@/views/dashboard/contract-signing/index.vue'),
          meta: {
            title: '签约与续签',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'certificates',
          name: 'certificates',
          component: () => import('@/views/dashboard/certificates/index.vue'),
          meta: {
            title: '证书管理',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'chat',
          name: 'chat',
          component: () => import('@/views/dashboard/chat/index.vue'),
          meta: {
            title: '即时通讯',
            requiresAuth: true
          }
        },
        // 考勤管理路由
        {
          path: 'attendance-menu',
          name: 'attendance-menu',
          component: () => import('@/views/dashboard/home/index.vue'), // 使用一个临时组件作为容器
          meta: {
            title: '考勤相关',
            requiresAuth: true
          },
          redirect: { name: 'attendance' } // 默认重定向到考勤管理页面
        },
        {
          path: 'attendance',
          name: 'attendance',
          meta: {
            title: '考勤管理',
            requiresAuth: true
          },
          redirect: to => {
            // 获取用户仓库实例
            if (!userStore) {
              userStore = useUserStore()
            }
            
            // 根据用户角色重定向到不同的考勤管理页面
            if (userStore.isAdmin) {
              return { name: 'attendance-admin' }
            } else if (userStore.isCompanyAdmin) {
              return { name: 'attendance-company' }
            } else if (userStore.isProjectManager) {
              return { name: 'attendance-manager' }
            } else {
              return { name: 'dashboard-home' }
            }
          }
        },
        {
          path: 'attendance/admin',
          name: 'attendance-admin',
          component: () => import('@/views/dashboard/attendance/admin.vue'),
          meta: {
            title: '考勤管理 - 系统管理员',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'attendance/company',
          name: 'attendance-company',
          component: () => import('@/views/dashboard/attendance/company.vue'),
          meta: {
            title: '考勤管理 - 企业管理员',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'attendance/manager',
          name: 'attendance-manager',
          component: () => import('@/views/dashboard/attendance/manager.vue'),
          meta: {
            title: '考勤管理 - 项目经理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'attendance/:id',
          name: 'attendance-detail',
          component: () => import('@/views/dashboard/attendance/detail.vue'),
          meta: {
            title: '考勤详情',
            requiresAuth: true
          }
        },
        // 请假管理路由
        {
          path: 'leave',
          name: 'leave',
          meta: {
            title: '请假管理',
            requiresAuth: true
          },
          redirect: to => {
            // 获取用户仓库实例
            if (!userStore) {
              userStore = useUserStore()
            }
            
            // 根据用户角色重定向到不同的请假管理页面
            if (userStore.isAdmin) {
              return { name: 'leave-admin' }
            } else if (userStore.isCompanyAdmin) {
              return { name: 'leave-company' }
            } else if (userStore.isProjectManager) {
              return { name: 'leave-manager' }
            } else {
              return { name: 'dashboard-home' }
            }
          }
        },
        {
          path: 'leave/admin',
          name: 'leave-admin',
          component: () => import('@/views/dashboard/leave/admin.vue'),
          meta: {
            title: '请假管理 - 系统管理员',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'leave/company',
          name: 'leave-company',
          component: () => import('@/views/dashboard/leave/company.vue'),
          meta: {
            title: '请假管理 - 企业管理员',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'leave/manager',
          name: 'leave-manager',
          component: () => import('@/views/dashboard/leave/manager.vue'),
          meta: {
            title: '请假管理 - 项目经理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'leave/:id',
          name: 'leave-detail',
          component: () => import('@/views/dashboard/leave/detail.vue'),
          meta: {
            title: '请假详情',
            requiresAuth: true
          }
        },
        {
          path: 'leave/approval-logs',
          name: 'leave-approval-logs',
          component: () => import('@/views/dashboard/leave/approval-logs.vue'),
          meta: {
            title: '请假审批记录',
            requiresAuth: true
          }
        },
        // 考勤统计路由
        {
          path: 'attendance-statistics',
          name: 'attendance-statistics',
          meta: {
            title: '考勤统计',
            requiresAuth: true
          },
          redirect: to => {
            // 获取用户仓库实例
            if (!userStore) {
              userStore = useUserStore()
            }
            
            // 根据用户角色重定向到不同的考勤统计页面
            if (userStore.isAdmin) {
              return { name: 'attendance-statistics-admin' }
            } else if (userStore.isCompanyAdmin) {
              return { name: 'attendance-statistics-company' }
            } else if (userStore.isProjectManager) {
              return { name: 'attendance-statistics-manager' }
            } else {
              return { name: 'dashboard-home' }
            }
          }
        },
        {
          path: 'attendance-statistics/admin',
          name: 'attendance-statistics-admin',
          component: () => import('@/views/dashboard/attendance-statistics/admin.vue'),
          meta: {
            title: '考勤统计 - 系统管理员',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'attendance-statistics/company',
          name: 'attendance-statistics-company',
          component: () => import('@/views/dashboard/attendance-statistics/company.vue'),
          meta: {
            title: '考勤统计 - 企业管理员',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'attendance-statistics/manager',
          name: 'attendance-statistics-manager',
          component: () => import('@/views/dashboard/attendance-statistics/manager.vue'),
          meta: {
            title: '考勤统计 - 项目经理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        // 项目成员评估模块路由
        {
          path: 'performance-menu',
          name: 'performance-menu',
          component: () => import('@/views/dashboard/home/index.vue'), // 使用一个临时组件作为容器
          meta: {
            title: '评估管理',
            requiresAuth: true
          },
          redirect: { name: 'performance' } // 默认重定向到绩效评估页面
        },
        {
          path: 'performance',
          name: 'performance',
          meta: {
            title: '绩效评估',
            requiresAuth: true
          },
          redirect: to => {
            // 获取用户仓库实例
            if (!userStore) {
              userStore = useUserStore()
            }
            
            // 根据用户角色重定向到不同的绩效评估页面
            if (userStore.isAdmin) {
              return { name: 'performance-admin' }
            } else if (userStore.isCompanyAdmin) {
              return { name: 'performance-company' }
            } else if (userStore.isProjectManager) {
              return { name: 'performance-manager' }
            } else {
              return { name: 'dashboard-home' }
            }
          }
        },
        {
          path: 'performance/admin',
          name: 'performance-admin',
          component: () => import('@/views/dashboard/performance/admin.vue'),
          meta: {
            title: '绩效评估 - 系统管理员',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'performance/company',
          name: 'performance-company',
          component: () => import('@/views/dashboard/performance/company.vue'),
          meta: {
            title: '绩效评估 - 企业管理员',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'performance/manager',
          name: 'performance-manager',
          component: () => import('@/views/dashboard/performance/manager.vue'),
          meta: {
            title: '绩效评估 - 项目经理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'performance/:id',
          name: 'performance-detail',
          component: () => import('@/views/dashboard/performance/detail.vue'),
          meta: {
            title: '绩效评估详情',
            requiresAuth: true
          }
        },
        // 工资管理路由
        {
          path: 'salary-menu',
          name: 'salary-menu',
          component: () => import('@/views/dashboard/home/index.vue'), // 使用一个临时组件作为容器
          meta: {
            title: '工资管理',
            requiresAuth: true
          },
          redirect: { name: 'salary' } // 默认重定向到工资管理页面
        },
        {
          path: 'salary',
          name: 'salary',
          meta: {
            title: '工资管理',
            requiresAuth: true
          },
          redirect: to => {
            // 获取用户仓库实例
            if (!userStore) {
              userStore = useUserStore()
            }
            
            // 根据用户角色重定向到不同的工资管理页面
            if (userStore.isAdmin) {
              return { name: 'salary-admin' }
            } else if (userStore.isCompanyAdmin) {
              return { name: 'salary-company' }
            } else if (userStore.isProjectManager) {
              return { name: 'salary-manager' }
            } else {
              return { name: 'dashboard-home' }
            }
          }
        },
        {
          path: 'salary/admin',
          name: 'salary-admin',
          component: () => import('@/views/dashboard/salary/index.vue'),
          meta: {
            title: '工资管理 - 系统管理员',
            requiresAuth: true,
            adminOnly: true
          }
        },
        {
          path: 'salary/company',
          name: 'salary-company',
          component: () => import('@/views/dashboard/salary/index.vue'),
          meta: {
            title: '工资管理 - 企业管理员',
            requiresAuth: true,
            companyAdminOnly: true
          }
        },
        {
          path: 'salary/manager',
          name: 'salary-manager',
          component: () => import('@/views/dashboard/salary/index.vue'),
          meta: {
            title: '工资管理 - 项目经理',
            requiresAuth: true,
            managerOnly: true
          }
        },
        {
          path: 'salary/detail/:id',
          name: 'salary-detail',
          component: () => import('@/views/dashboard/salary/detail.vue'),
          meta: {
            title: '工资详情',
            requiresAuth: true
          }
        },
        // 添加用户管理路由
        {
          path: '/dashboard/users',
          component: () => import('@/views/dashboard/users/index.vue'),
          name: 'UserManagement',
          meta: {
            title: '用户管理',
            icon: 'user',
            roles: ['system_admin']
          }
        },
        // 其他子路由可以在这里添加
      ]
    },
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/404.vue'),
      meta: {
        title: '页面未找到',
        requiresAuth: false
      }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 工程项目管理系统` : '工程项目管理系统'

  // 初始化用户仓库
  if (!userStore) {
    userStore = useUserStore()
  }

  // 检查是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 确保用户信息被加载
    if (!userStore.isLoggedIn) {
      // 尝试初始化（检查本地存储中的token并加载用户信息）
      const isInit = await userStore.init()
      
      if (!isInit) {
        // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
        return
      }
    }
    
      // 检查是否是管理员限制的路由
      if (to.matched.some(record => record.meta.adminOnly)) {
      if (!userStore.isAdmin) {
        ElMessage.error('该页面仅限系统管理员访问')
          next({ path: '/dashboard' })
          return
        }
      }
      
      // 检查是否是企业管理员限制的路由
      if (to.matched.some(record => record.meta.companyAdminOnly)) {
      if (!userStore.isCompanyAdmin) {
          ElMessage.error('该页面仅限企业管理员访问')
          next({ path: '/dashboard' })
          return
        }
      }
      
      // 检查是否是项目经理限制的路由
      if (to.matched.some(record => record.meta.managerOnly)) {
      if (!userStore.isProjectManager) {
          ElMessage.error('该页面仅限项目经理访问')
          next({ path: '/dashboard' })
          return
        }
      }
      
      next()
  } else {
    next()
  }
})

export default router
