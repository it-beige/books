import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'user/login',
    method: 'post',
    data
  })
}

// 第三放登录
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
