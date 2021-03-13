import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import getters from './getters'

// 创建对象，借助浏览器缓存，存入localStorage

const vuexLocal = new VuexPersistence({
  key: 'myVuex', // defalut: vuex
  // 将函数保存为持久化，每次页面刷新都会执行下该函数
  // saveState: (key, state, storage) => {
  //   console.log(key, state, storage)
  // },
  // Storage中的数据进行筛选添加到state
  // restoreState: (key, storage) => {
  //   // console.log(key, storage)
  //   return { [key]: storage }
  // },
  // 默认情况下保存整个状态, 该方法可以筛选state根据需求减少到只需要保存的状态 。
  // reducer: (state) => {
  //   const userState = Object.entries(state).find(s => s[0] === 'user')
  //   // console.log(userState)
  //   console.log({ [userState[0]]: userState[1] })
  //   return { [userState[0]]: userState[1] } // 这个就是存入Storage的值
  // }
  modules: ['app'],
  // filter: (mutation) => { // 控制mutations中的方法是否触发
  //   console.log(mutation)
  //   if (mutation.type === 'user/SET_NAME') {
  //     return false
  //   } else {
  //     return true
  //   }
  // }
})
Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)
// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.+)\.\w+$/, '$1')

  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

// 使用该插件
const store = new Vuex.Store({
  modules,
  getters,
  plugins: [vuexLocal.plugin]
})

export default store
