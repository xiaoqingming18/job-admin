import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkPermission } from '@/utils/auth'

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
            // 根据用户类型重定向到不同的劳务需求管理页面
            const userType = localStorage.getItem('userType')
            if (userType === 'admin') {
              return { name: 'labor-demands-admin' }
            } else if (userType === 'company') {
              return { name: 'labor-demands-company' }
            } else if (userType === 'manager') {
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
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 工程项目管理系统` : '工程项目管理系统'

  // 检查是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 检查是否是管理员限制的路由
      if (to.matched.some(record => record.meta.adminOnly)) {
        if (!checkPermission(true)) {
          next({ path: '/dashboard' })
          return
        }
      }
      
      // 检查是否是企业管理员限制的路由
      if (to.matched.some(record => record.meta.companyAdminOnly)) {
        const userType = localStorage.getItem('userType')
        if (userType !== 'company') {
          ElMessage.error('该页面仅限企业管理员访问')
          next({ path: '/dashboard' })
          return
        }
      }
      
      next()
    }
  } else {
    next()
  }
})

export default router
