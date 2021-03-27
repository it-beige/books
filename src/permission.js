import router from './router'
import store from './store'
import { Message } from 'element-ui'
import { getLoginData, closeLoading } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import NProgress from 'nprogress'
NProgress.configure({ showSpinner: false }) // NProgress Configuration
import action from '@/shared/action'

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  start()
  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const { token, appid } = getLoginData()

  // 需同时校验token,appid
  if (token && appid) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles && appid) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')
          // generate accessible routes map based on roles
          let accessRoutes = []
          if (roles.includes('test')) {
            accessRoutes = await store.dispatch('permission/testRoutes', { roles, appid })
          } else {
            accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          }

          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          closeLoading()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      closeLoading()
    }
  }
})

// 启动顶部进度条
function start() {
  if (self !== top) {
    action.postMessage('startProgress')
  } else {
    NProgress.start()
  }
}

// 关闭顶部进度条
function done() {
  if (self !== top) {
    action.postMessage('doneProgress')
  } else {
    NProgress.done()
  }
}

router.afterEach(() => {
  done()
  // 清理loading状态，请注意清理不然一直显示loading
  closeLoading()
})
