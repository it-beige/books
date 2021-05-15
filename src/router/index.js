import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* 页面框架 */
import Layout from '@/layout'
/* login模块 */
import login from './login'

/* A模块 */
// import testA from './testA'
/* B模块 */
// import testB from './testB'
/* C模块 */
// import testC from './testC'
/* D模块 */
// import testD from './testD'
/* E模块 */
// import testE from './testE'
/* F模块 */
// import testF from './testF'
/* G模块 */
// import testG from './testG'
/* 测试组件模块 */
// import testComponents from './testComponents'
/* 测试excel模块 */
import testExcel from './testExcel'
/* 电子书模块 */
// import book from './book'

export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/blog',
    children: [
      {
        path: 'blog',
        component: () => import('@/views/blog/index'),
        name: 'Blog',
        meta: {
          title: '项目系列文章',
          icon: 'dashboard',
          affix: true,
        }
      }
    ]
  },
  ...login,
  {
    path: '/redirect',
    component: Layout,
    hidden: true, // 在侧边栏隐藏
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'http://beige.world',
        meta: { title: '个人博客', icon: 'link' }
      }
    ]
  },
  {
    path: '/401',
    name: '401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
]

/* 动态加载路由，根据权限设定来加载，和管理系统的侧边栏对应 */
export const asyncRoutes = [
  // ...book,
  // ...testA,
  // ...testB,
  // ...testC,
  // ...testD,
  // ...testE,
  // ...testF,
  // ...testG,
  // ...testComponents,
  ...testExcel,
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()
// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
