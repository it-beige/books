import request from '@/utils/request'

// 报表的导出列表的全量数据
export function getAllListData(url, params = {}) {
  return request({
    url,
    method: 'get',
    params
  })
}
