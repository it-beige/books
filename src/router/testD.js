import Layout from '@/layout'

const routes = [
  {
    path: '/testD',
    component: Layout,
    redirect: '/D',
    children: [
      {
        path: '/D',
        name: 'D',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'D组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testD/A')
      },
    ]
  },
]
export default routes
