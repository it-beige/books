import Layout from '@/layout'

const routes = [
  {
    path: '/testB',
    component: Layout,
    redirect: '/B',
    children: [
      {
        path: '/B',
        name: 'B',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'B组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testB/A')
      },
    ]
  },
]
export default routes
