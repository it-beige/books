import Layout from '@/layout'

const routes = [
  {
    path: '/book',
    name: 'book',
    component: Layout,
    redirect: '/book/create',
    meta: {
      title: '图书管理',
      icon: 'documentation',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: '/book/create',
        name: 'bookCreate',
        component: () => import('@/views/book/book-create'),
        meta: {
          title: '上传图书',
          icon: 'edit',
          roles: ['admin', 'editor']
        }
      },
      {
        path: '/book/edit/:fileName',
        props: true,
        name: 'bookEdit',
        component: () => import('@/views/book/book-edit'),
        hidden: true,
        meta: {
          title: '编辑图书',
          roles: ['admin'],
          activeMenu: '/book/list'
        }
      },
      {
        path: '/book/list',
        component: () => import('@/views/book/book-list'),
        meta: {
          title: '图书列表',
          name: 'bookList',
          icon: 'list',
          roles: ['admin', 'editor']
        }
      },
      // {
      //   path: 'delivery',
      //   name: 'Delivery',
      //   meta: {
      //     title: '路由跳转问题',
      //     icon: 'el-icon-s-opportunity'
      //   },
      //   component: () => import('@/views/delivery')
      // },
      // {
      //   path: 'delivery-form',
      //   name: 'DeliveryForm',
      //   meta: {
      //     title: '路由跳转问题-表单',
      //   },
      //   hidden: true,
      //   component: () => import('@/views/delivery/form')
      // },
    ]
  }
]
export default routes
