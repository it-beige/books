import Layout from '@/layout'

const routes = [
  {
    path: '/testC',
    component: Layout,
    redirect: '/C',
    children: [
      {
        path: '/C',
        name: 'C',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'C组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testC/A')
      },
    ]
  },
]
export default routes
