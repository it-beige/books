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

export function getInfo(token) {
  return request({
    url: 'user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: 'user/logout',
    method: 'post'
  })
}
