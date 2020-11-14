import Layout from '@/layout'

const routes = [
  {
    path: '/testA',
    component: Layout,
    redirect: '/A',
    children: [
      {
        path: '/A',
        name: 'A',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'A组件(测试权限)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testA/A')
      },
    ]
  },
]
export default routes
