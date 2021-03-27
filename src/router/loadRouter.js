import Layout from '@/layout'
import { AppMain } from '@/layout/components'
const FUNC_ROOT_ID = '0'
const FUNC_NAV = 'NAVDIR'
const FUNC_MENU = 'FUNCMENU'
const FUNC_VIEWPAGE = 'VIEWPAGE'
import shared from '@/shared'
let baseUrl = ''
const loadRouter = {
  build(funclist) {
    if (shared && shared.getName) {
      baseUrl = shared.getName()
    }
    generateRouter(funclist)
    return newRouters
  }
}
/** 获取组件名称**/
let componentsNameObj = {}
function initComponentName() {
  const files = require.context(`@/views`, true, /\.vue$/)
  componentsNameObj = files.keys().reduce((modules, modulePath) => {
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const value = files(modulePath)
    modules[moduleName] = value.default.name
    return modules
  }, {})
}
initComponentName()

function getComponentNameByPath(path) {
  return componentsNameObj[path]
}

// 动态加载vue配置
const lazyView = (name) => {
  return function(resolve) {
    require([`@/views/${name}.vue`], resolve)
  }
}
const dynamicRouteNav = ({ funcId, funcName, funcIcon }, isOneLvevlNav) => {
  return isOneLvevlNav ? {
    path: `/${funcId}`,
    component: Layout,
    // 默认显示文件夹导航
    alwaysShow: true,
    meta: { title: funcName, icon: funcIcon || 'example', breadcrumbClick: 'disanble' },
    children: []
  } : {
    path: `/${funcId}`,
    // 一级以下目录，显示appmain应用路由对象
    component: AppMain,
    alwaysShow: true,
    meta: { title: funcName, icon: funcIcon || 'example', breadcrumbClick: 'disanble' },
    children: []
  }
}
const dynamicRouteMenu = ({ funcId, funcPid, funcName, funcUrl, funcIcon, acl }) => {
  const aclMap = {}
  acl.forEach(item => {
    aclMap[item.eleCode] = { view: item.aclView, operate: item.aclOperate }
  })
  return {
    path: `/${funcUrl}`,
    name: getComponentNameByPath(funcUrl) || funcId,
    component: lazyView(funcUrl),
    meta: { title: funcName, icon: funcIcon || 'example', acl: aclMap },
    children: []
  }
}
/**
 * 视图路由
 * @param {*} 功能对象
 * @param {*} viewParenUrl  功能视图对象父级url
 * @param {*} viewPid  功能视图对象父级pid
 */
const menuPageViewRouter = ({ funcId, funcPid, funcName, funcUrl, funcIcon, acl, funcType }, viewParenUrl, viewPid) => {
  const aclMap = {}
  acl.forEach(item => {
    aclMap[item.eleCode] = { view: item.aclView, operate: item.aclOperate }
  })
  const loadViewDir = viewParenUrl.substring(0, viewParenUrl.lastIndexOf('/'))
  return {
    path: `/${loadViewDir}/${funcUrl}`,
    name: getComponentNameByPath(`${loadViewDir}/${funcUrl}`) || funcId,
    component: lazyView(`${loadViewDir}/${funcUrl}`),
    hidden: true,
    meta: { title: funcName, funcType: funcType, icon: funcIcon || 'example', prevname: funcPid, acl: aclMap }
  }
}
const dynamicRouteNavMenu = ({ funcId, funcName, funcUrl, funcIcon }) => {
  return {
    path: `${baseUrl}/${funcId}`,
    component: Layout,
    children: [
      {
        path: `/${funcId}${funcUrl}`,
        name: getComponentNameByPath(funcUrl) || funcId,
        component: lazyView(funcUrl),
        meta: { title: funcName, icon: funcIcon || 'example' }
      }
    ]
  }
}
const newRouters = []
/**
 * 功能列表json导航数据构建路由对象
 */
function generateRouter(funcList = {}, tempIndex = 0, tempid, tempRouter = {}) {
  if (!tempid) {
    // 查找root 节点 -> 功能菜单
    const rootItem = funcList.find(item => item.funcPid === FUNC_ROOT_ID)
    funcList.filter(item => item.funcPid === rootItem.funcId).forEach((funcItem, i) => {
      // 导航
      if (funcItem.funcType === FUNC_NAV) {
        const routerItem = generateRouter(funcList, 0, funcItem.funcId, dynamicRouteNav(funcItem, true))
        newRouters.push(routerItem)
        // 特殊处理项，功能&导航
      } else if (funcItem.funcType === FUNC_MENU) {
        newRouters.push(dynamicRouteNavMenu(funcItem))
      }
    })
  }
  for (let i = tempIndex; i < funcList.length; i++) {
    const funcItem = funcList[i]
    // 导航
    if (funcItem.funcType === FUNC_NAV && funcItem.funcPid === tempid) {
      const funcRouter = dynamicRouteMenu(funcItem)
      setFuncViewPageRouter(i + 1, funcList, tempRouter, funcItem.funcId, funcItem.funcUrl, funcItem.funcPid)
      tempRouter.children.push(funcRouter)
    } else if (funcItem.funcType === FUNC_MENU && funcItem.funcPid === tempid) {
      // 进入功能菜单构建
      // 构建子菜单
      const funcRouter = dynamicRouteMenu(funcItem)
      setFuncViewPageRouter(i + 1, funcList, tempRouter, funcItem.funcId, funcItem.funcUrl, funcItem.funcPid)
      tempRouter.children.push(funcRouter)
    }
  }
  return tempRouter
}
function setFuncViewPageRouter(nextIndex, funcList, funcRouter, tempid, viewParentUrl, viewPid) {
  // funcRouter.children=[{}]
  for (let j = nextIndex; j < funcList.length; j++) {
    const funcItem = funcList[j]
    if (funcItem.funcType === FUNC_VIEWPAGE && funcItem.funcPid === tempid) {
      // 功能视图路由
      funcRouter.children.push(menuPageViewRouter(funcList[j], viewParentUrl, viewPid))
    }
  }
}
// 导出对象
export default loadRouter
