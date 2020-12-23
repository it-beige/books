import request from '@/utils/request'

export function getTables(params) {
  return request({
    url: '/dynamic/getEntityData',
    method: 'get',
    params
  })
}

export function del(url, params) {
  return request({
    url: url,
    method: 'delete',
    params
  })
}
