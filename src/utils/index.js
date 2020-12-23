/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}
// 判断数据类型

const isType = (type) => (obj) => Object.prototype.toString.call(obj) === `[object ${type}]`

export function isObject(obj) {
  return isType('Object')(obj)
}
export function isArray(obj) {
  return isType('Array')(obj)
}

// 生成guid 是否分割 默认不加-
export function guid(split = '') {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + split + S4() + split + S4() + split + S4() + split + S4() + S4() + S4())
}
/**
 * @description 生成uuid 默认是36为uuid 设置长度则是随机长度字符串
 * @param {Number} len 生成字符串的长度 如果不填默认是uuid
 * @param {Number} radix 支持的进制 2 10 16进制 默认16
 */
export function uuid(len, radix) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  let i = 0
  if (len) {
    const charLen = radix || chars.length
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * charLen]
  } else {
    // rfc4122, version 4 form
    let r
    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    // Fill in random data. At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}
/**
 * 判断两个对象是否数据相等
 * @param {Object | Array} obj1
 * @param {Object | Array} obj2
 * @param {Array} filterProtoerys 过滤的属性 不判断此属性
 */
export function isEqual(obj1, obj2, filterProtoerys) {
  // undefined 也会判断为相等
  if (!obj1) return obj1 === obj2
  if (!obj2) return obj1 === obj2
  if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) { /*  判断不是对象  */
    return obj1 === obj2
  }
  if (!filterProtoerys) {
    // 判断对象key的个数是否相等 不相等直接返回false
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false
    }
  }
  for (var key in obj1) {
    // 判断是否有过滤属性 或者过滤属性数组
    if (filterProtoerys) {
      if (Array.isArray(filterProtoerys)) {
        if (filterProtoerys.includes(key)) {
          continue
        }
      } else if (filterProtoerys === key) {
        continue
      }
    }
    // 判断是否是对象 如果是则递归
    if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
      if (!isEqual(obj1[key], obj2[key], filterProtoerys)) {
        return false
      }
    } else if (obj1[key] !== obj2[key]) {
      return false
    }
  }
  return true
}
/**
 * 判断两个对象里面指定的属性名的值是否相等
 * @param {Object | Array} obj1
 * @param {Object | Array} obj2
 * @param {Array} protoerys 需要对比的属性名
 */
export function isEqualProtoerys(obj1, obj2, protoerys = []) {
  // undefined 也会判断为相等
  if (!obj1) return obj1 === obj2
  if (!obj2) return obj1 === obj2
  if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) { /*  判断不是对象  */
    return obj1 === obj2
  }
  for (const index in protoerys) {
    const key = protoerys[index]
    if (obj1[key] === obj2[key]) {
      continue
    } else if (typeof obj1[key] === typeof obj2[key]) {
      return false
    } else if (obj1[key] && obj2[key]) {
      // 判断值是否一样 不一样则直接返回
      if (obj1[key].toString() !== obj2[key].toString()) {
        return false
      }
    } else if (!obj1[key] && !obj2[key]) {
      continue
    } else {
      return false
    }
  }
  return true
}

/**
 * 格式化文件大小, 输出成带单位的字符串
 * @param {Number} size 文件大小
 * @param {Number} [pointLength=2] 精确到的小数点数。
 * @param {Array} [units=[ 'B', 'K', 'M', 'G', 'TB' ]] 单位数组。从字节，到千字节，一直往上指定。
 *    如果单位数组里面只指定了到了K(千字节)，同时文件大小大于M, 此方法的输出将还是显示成多少K.
 */
export function formatSize(size, pointLength, units) {
  var unit
  if (size === '' || size === null || size === undefined) {
    return ''
  }
  if (isNaN(size)) {
    return ''
  }
  units = units || ['B', 'K', 'M', 'G', 'TB']
  while ((unit = units.shift()) && size > 1024) {
    size = size / 1024
  }
  return (unit === 'B' ? size : size.toFixed(pointLength === undefined ? 2 : pointLength)) + unit
}

/**
 * @description:
 * @param {Array} list  去重的数据
 * @param {String} filed 要去重的字段
 * @return {Object} 重复的数据
 */
export function unique(list, filed) {
  const hash = new Map()
  const repeat = list.find(i => {
    if (hash.has(i[filed])) {
      return hash.get(i[filed])
    } else {
      hash.set(i[filed], 1)
      return false
    }
  })

  return repeat
}

/**
 * @description:
 * @param {*} val
 * @param {*} options
 * @return {*}
 * @Date Changed:
 */
export function formatOptions(val, options = []) {
  if (val && options.length > 0) {
    return options.find(i => i.codeValue === val).codeKey
  }
}

/**
 * 计算获取差异数据
 * @param target 新数据
 * @param source 旧数据
 * @param entryFields 分录字段名
 * @param pk 标识字段 默认 id
 * @returns {{create: {}, update: {}, delete: {}}}
 */
export function getDiffData(target = {}, source = {}, { entryFields = [], pk = 'id' }) {
  let createData = {}
  let updateData = {}
  let deleteData = {}
  // 原数据为空 全是新增的数据
  if (Object.keys(source).length === 0) {
    createData = target
  } else {
    createData = deepClone(target)
    deleteData = deepClone(target)
    updateData = deepClone(target)
  }
  // 分录字段
  if (entryFields && entryFields.length) {
    entryFields.forEach(field => {
      const entry = target[field]
      if (entry instanceof Array && entry.length) {
        // 没有id的都是新增的
        createData[field] = entry.filter(e => !e[pk])
        // 有id的都是做修改
        const hasIdData = entry.filter(e => !!e[pk])
        updateData[field] = hasIdData
        // 被删除的数据
        if (source) {
          const sourceEntry = source[field]
          if (sourceEntry && sourceEntry.length) {
            deleteData[field] = sourceEntry.filter(se => {
              return se[pk] && hasIdData.findIndex(h => h[pk] === se[pk]) === -1
            })
          } else {
            deleteData[field] = []
          }
        } else {
          deleteData[field] = []
        }
      }
    })
  }
  return {
    create: createData,
    update: updateData,
    delete: deleteData
  }
}

/**
 * @description: 解决router使用back | go 页面栈中没有记录导致404问题
 * @param {String} path 指定跳页路径
 * @return {Boolean}
 */
export function back(path = '/') {
  if (window.history.length <= 1) {
    this.$router.push({ path: path })
    return false
  } else {
    this.$router.back(-1)
  }
  //  history记录数量大于1，又没有回退记录，返回指定页面
  // setTimeout(() => {
  //   this.$router.push({ path: path })
  // }, 500)
}

/**
 * @description:
 * @param {Object}
 * @keys {Array}
 * @return {Object}
 * @Date Changed:
 */

/**
 * @description:  从对象中找到对应的字段赋默认值
 * @param {Object} obj 目标对象
 * @param {Array} keys 要赋值的字段集合
 * @return {Object} 赋值好的对象
 * @Date Changed:
 */
export function objectToDefaultVal(obj, keys) {
  if (!isObject(obj)) return
  return Reflect.ownKeys(obj).reduce((newObj, key) => {
    if (keys.includes(key)) {
      newObj[key] = obj[key]
    }
    return newObj
  }, {})
}

/**
 * @description: 批量设置值
 */
export function batchSetVal(keys, model) {
  keys.forEach(key => {
    this.$set(model, key, model[key])
  })
}
