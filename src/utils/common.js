const Base64 = require('js-base64').Base64
import { getToken } from '@/utils/auth'

export const Base64Util = {
  encode: function(content) {
    return Base64.encode(content)
  },
  decode: function(content) {
    return Base64.decode(content)
  }
}

export const FileUtil = {
  getFileByIds: function(ids) {
    const array = ids.split(',')
    const list = []
    array.forEach((item, index) => {
      // 解码
      const fileModel = JSON.parse(Base64Util.decode(item))
      const file = {}
      file.name = fileModel.name // 解析出名字显示在页面上
      file.url = process.env.BASE_API + '/file/get?token=' + getToken() + '&key=' + item

      list.push(file)
    })
    return list
  },
  getFileById: function(id) {
    return JSON.parse(Base64Util.decode(id))
  },
  getFileUrlById: function(id) {
    return process.env.BASE_API + '/file/get?token=' + getToken() + '&key=' + encodeURIComponent(id)
  },
  getHeaders: function() {
    return { 'Authorization': getToken() }
  }
}

