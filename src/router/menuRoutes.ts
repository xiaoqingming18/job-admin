export default [
  {
    path: '/dashboard/occupations',
    meta: {
      title: '工种管理',
      icon: 'worker'
    }
  },
  {
    path: '/dashboard/labor-demands',
    meta: {
      title: '劳务需求管理',
      icon: 'demand'
    }
  },
  {
    path: '/dashboard/managers',
    meta: {
      title: '项目经理管理',
      icon: 'manager'
    }
  },
  {
    path: '/dashboard/job-applications',
    meta: {
      title: '求职申请管理',
      icon: 'application'
    }
  },
  {
    path: '/dashboard/interviews',
    meta: {
      title: '面试管理',
      icon: 'interview'
    }
  },
  {
    path: '/dashboard/attendance',
    meta: {
      title: '考勤相关',
      icon: 'calendar'
    },
    children: [
      {
        path: '/dashboard/attendance',
        meta: {
          title: '考勤管理',
          icon: 'calendar'
        }
      },
      {
        path: '/dashboard/leave',
        meta: {
          title: '请假管理',
          icon: 'document'
        }
      },
      {
        path: '/dashboard/attendance-statistics',
        meta: {
          title: '考勤统计',
          icon: 'data-analysis'
        }
      }
    ]
  },
  {
    path: '/dashboard/performance',
    meta: {
      title: '评估管理',
      icon: 'star'
    },
    children: [
      {
        path: '/dashboard/performance',
        meta: {
          title: '绩效评估',
          icon: 'star'
        }
      }
    ]
  }
] 