/**
 * @info 封装Storage
 */

const GLOBAL_MODULE_NAME = 'book'
let cacheStorage = {}

class Storage {
  constructor(type) {
    this.type = type
  }

  // 获取整个模块的storage
  getStorage(key = GLOBAL_MODULE_NAME) {
    return JSON.parse(window[this.type].getItem(key)) || {}
  }

  // 设置
  setItem(key, value, moduleName) {
    if (moduleName) {
      const val = this.getItem(moduleName)
      val[key] = value
      this.setItem(moduleName, val)
    } else {
      const val = this.getStorage()
      val[key] = value
      window[this.type].setItem(GLOBAL_MODULE_NAME, JSON.stringify(val))
    }
  }

  // 获取
  getItem(key, moduleName) {
    if (JSON.stringify(cacheStorage) === '{}') {
      cacheStorage = this.getStorage()
    }

    if (moduleName) {
      const val = cacheStorage[moduleName]
      if (val) return val[key]
    }
    return cacheStorage[key]
  }

  // 删除
  removeItem(key, moduleName) {
    const val = this.getStorage()
    if (moduleName) {
      delete val[moduleName][key]
    } else {
      delete val[key]
    }
    window[this.type].setItem(GLOBAL_MODULE_NAME, JSON.stringify(val))
  }
}

export default Storage
