import Layout from '@/layout'

const routes = [
  {
    path: '/test-excel',
    name: 'testExcel',
    component: Layout,
    redirect: '/A',
    children: [
      {
        path: '/test-excel/A',
        name: 'TestExcelA',
        hidden: false,
        meta: {
          title: 'excel(测试A)',
          icon: 'el-icon-s-opportunity',
          roles: ['admin'],
        },
        component: () => import('@/views/test-excel/A/index.vue'),
      },
    ]
  },
]
export default routes
