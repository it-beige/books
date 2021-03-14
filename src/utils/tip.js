import { Message } from 'element-ui'
import { isObject } from '@/utils/index'
import Vue from 'vue'

function Tip(type, value, options = {}) {
  if (!type) {
    throw new Error('type must pass!')
  }
  const {
    duration = 5000,
    showClose = false,
  } = options

  const message = isObject(value) && (value.msg || value.message) || value || '操作失败'
  Message.closeAll()
  Message({
    message: message,
    type: type,
    showClose: showClose,
    duration: duration
  })
}

export function showSuccess(msg, ...options) {
  // 如果传递了配置项实用自定义的配置项
  Tip('success', msg, { ...options })
}

export function showError(msg, ...options) {
  // 如果传递了配置项实用自定义的配置项
  Tip('error', msg, { ...options })
}

export function showWarning(msg, ...options) {
  // 如果传递了配置项实用自定义的配置项
  Tip('warning', msg, { ...options })
}

Vue.prototype.$showSuccess = showSuccess
Vue.prototype.$showError = showError
Vue.prototype.$showWarning = showWarning

