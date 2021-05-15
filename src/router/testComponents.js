import Layout from '@/layout'

const routes = [
  {
    path: '/testComponents',
    component: Layout,
    redirect: '/A',
    children: [
      {
        path: '/A',
        name: 'A',
        hidden: false, // 显示在侧边栏上
        meta: {
          title: 'DynamicSelect组件(测试)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/testComponents/A'),
      },
    ]
  },
]
export default routes
