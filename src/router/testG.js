import Layout from '@/layout'

const routes = [
  {
    path: '/testG',
    component: Layout,
    redirect: '/G',
    children: [
      {
        path: '/G',
        name: 'G',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'G组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testG/A')
      },
    ]
  },
]
export default routes
