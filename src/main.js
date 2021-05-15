import Vue from 'vue'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

// 使用动画库
import animated from 'animate.css'
Vue.use(animated)

import Element from 'element-ui'
import './styles/element-variables.scss'

// 使用扩展的动态表格
import VueElementExtends from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'
Vue.use(VueElementExtends)

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import Storage from './storage'
import request from './utils/request'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import './utils/tip' // global tip utils

import * as filters from './filters' // global filters

// global components
const r = require.context('./components/common', true, /\.vue$/)
r.keys().forEach(path => {
  const filePath = path.substr(2)
  const module = require('./components/common/' + filePath)
  Vue.component(module.default.name, module.default)
})
import '@/components/common/EditDataTable'

Vue.use(Element, {
  size: store.getters.size, // set element-ui default size
})

Vue.prototype.$http = request
Vue.prototype.sessionStorage = new Storage('sessionStorage')
Vue.prototype.localStorage = new Storage('localStorage')

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

// 对全局的错误进行异常监控
// Vue.config.errorHandler = function(err, vm, info) {
//   /* eslint-disable */
//   const {
// 	  message, // 异常信息
// 	  name, // 异常名称
// 	  script, // 异常脚本url
// 	  line, // 异常行号
// 	  column, // 异常列号
// 	  stack // 异常堆栈信息
//   } = err

//   // vm为抛出异常的 Vue 实例
//   // info为 Vue 特定的错误信息，比如错误所在的生命周期钩子
//   console.error(message)
// }

