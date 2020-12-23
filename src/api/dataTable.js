import request from '@/utils/request'

/**
 * 拉取列表数据
 * @param url
 * @param params
 */
export function initData(url, params) {
  return request({
    url: url,
    method: 'get',
    params: params
  })
}
