import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'user/login',
    method: 'post',
    data
  })
}

// 第三方登录
export function thirdpartLogin(params) {
  return request({
    url: 'user/thirdpart/login',
    method: 'get',
    params
  })
}
// 获取用户信息
export function getInfo(token) {
  return request({
    url: 'user/info',
    method: 'get',
    params: { token }
  })
}

// 获取用户信息
export function getCode() {
  return request({
    url: 'user/getCode',
    method: 'post',
  })
}

// 登出
export function logout() {
  return request({
    url: 'user/logout',
    method: 'post'
  })
}

/**
 * 获取用户功能权限列表
 * @param {Object} params
 */
export function getUserFuncList(data) {
  return request({
    url: `user/route`,
    method: 'post',
    data
  })
}
