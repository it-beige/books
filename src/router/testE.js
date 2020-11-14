import Layout from '@/layout'

const routes = [
  {
    path: '/testE',
    component: Layout,
    redirect: '/E',
    children: [
      {
        path: '/E',
        name: 'E',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'E组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testE/A')
      },
    ]
  },
]
export default routes
