const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    name: 'authRedirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
]
export default routes
