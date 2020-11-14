import Layout from '@/layout'

const routes = [
  {
    path: '/testF',
    component: Layout,
    redirect: '/F',
    children: [
      {
        path: '/F',
        name: 'F',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'F组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testF/A')
      },
    ]
  },
]
export default routes
