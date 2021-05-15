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
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
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
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

// 判断数据类型

const isType = (type) => (obj) => Object.prototype.toString.call(obj) === `[object ${type}]`

export function isObject(obj) {
  return isType('Object')(obj)
}
export function isArray(obj) {
  return isType('Array')(obj)
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

export function getCookie(name) {
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  const arr = document.cookie.match(reg)
  if (arr) {
    return unescape(arr[2])
  } else {
    return null
  }
}

/**
 * @desc 格式化时间
 * @param {String} date 时间
 * @param {String} fmt 格式化配置字符串
 * @return {String} 返回格式化后的字符串时间
 */
export function formatDate2Str(date, fmt) {
  var currentDate = new Date(date)
  var o = {
    'M+': currentDate.getMonth() + 1, // 月份
    'd+': currentDate.getDate(), // 日
    'h+': currentDate.getHours(), // 小时
    'm+': currentDate.getMinutes(), // 分
    's+': currentDate.getSeconds(), // 秒
    'q+': Math.floor((currentDate.getMonth() + 3) / 3), // 季度
    'S': currentDate.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (currentDate.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  }
  return fmt
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
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
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
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

export function computeSum() {
  let sum = 0
  for (let i = 0; i < arguments.length; i++) {
    arguments[i] = arguments[i] || 0
    sum += arguments[i]
  }
  return sum
}
export function randomID(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const maxPos = chars.length
  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return str
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
      } else {
        const sourceEntry = source[field]
        deleteData[field] = sourceEntry
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

export function createGetValueByPath(path) {
  const paths = path.split('.') // [ xxx, yyy, zzz ]

  return function getValueByPath(obj) {
    let res = obj
    let deepObj = {} // 当前成员的所属Object
    let prop
    while (res ? prop = paths.shift() : '') {
      deepObj = res
      res = res[ prop ]
    }
    return {
      val: res,
      deepObj,
      prop
    }
  }
}

/**
 * @description: 深度设置对象成员
 * @param {Object} obj 要设置成员的对象
 * @param {Array} key名
 * @return {Object}
 */

export function setDeepAttribute(sourceObj, deepKeyValObj) {
  for (const [key, newValue] of Object.entries(deepKeyValObj)) {
    // 获取最深的成员key
    const getDeepAttr = createGetValueByPath(key)
    const { deepObj, prop } = getDeepAttr(sourceObj)
    Reflect.set(deepObj, prop, newValue)
  }
}

/**
 * @description: 从对象中找到对应的字段返回
 * @param {Object} obj
 * @param {String} key
 * @return {Object}
 */
export function getDeepAttribute(obj, key) {
  if (key.indexOf('.') !== -1) {
    const paths = key.split('.')
    let current = obj
    let result = null
    for (let i = 0, j = paths.length; i < j; i++) {
      const path = paths[i]
      if (!current) break
      if (i === j - 1) {
        result = current[path]
        break
      }
      current = current[path]
    }
    return result
  } else {
    return obj[key]
  }
}

/**
 * @description:  从对象中找到对应的字段赋默认值
 * @param {Object} obj 目标对象
 * @param {Array} keys 要赋值的字段集合
 * @return {Object} 赋值好的对象
 * @Date Changed:
 */
export function objectToDefaultVal(obj, keys) {
  if (!isObject(obj)) return

  return keys.reduce((newObj, key) => {
    if (getDeepAttribute(obj, key)) {
      if (key.substring(key.indexOf('.') + 1) !== key) {
        const ret = setDeepAttribute(key, newObj)
        // eslint-disable-next-line
        eval(`newObj.${ret.attr}=obj.${ret.attr}`)
      } else {
        newObj[key] = obj[key]
      }
    }
    return newObj
  }, {})
}

/**
 * @description: 批量设置值(不影响视图)
 */
export function batchSetVal(model, keyValMap) {
  [...keyValMap].forEach(item => {
    const key = item[0]
    const val = item[1]
    model[key] = val
  })
  return model
}

/**
 * @description: 合并对象(值为空的成员)
 */
export function mergeObjDebarEmpty(model, data, differenceKyeObj = {}) {
  // [null,undefined]数据的key删除掉
  Object.keys(data).forEach((key) => data[key] ?? Reflect.deleteProperty(data, key))

  return Object.assign(
    model,
    Object.entries(differenceKyeObj).reduce((data, [diffKey, curKey]) => {
      model[curKey] = isObject(data[diffKey]) ? deepClone(data[diffKey]) : data[diffKey]
      delete data[diffKey]
      return data
    }, data)
  )
}

/**
 * @description: 批量删除值
 */
export function batchDelVal(model, keys) {
  keys.forEach(key => {
    this.$delete(model, key)
  })
}

export const pipe = (...fns) => {
  return (data) => {
    return fns.reduce((list, fn, $i) => {
      return fn(list[$i])
    }, data)
  }
}

/**
 * @description: Diff出curList和sourceList不同的Row
 * @param {Array} curList
 * @param {Array} sourceList
 * @param {Array} filterFields 过滤不比较的字段
 * @return {List} curList中的Diff Rows
 * @Date Changed:
 */
export function diffUpdateData(curList, sourceList, filterFields) {
  return curList.reduce((diffList, curRow) => {
    // 有Id说明是新增过的数据做DIff, 如果是当前新增数据不做DIff
    if (curRow.id) {
      // 返回有差异的SourceRowIndex
      const diffRowIndex = sourceList.findIndex(sourceRow => {
        return isEqual(curRow, sourceRow, filterFields)
      },)

      // 将比较出当前的行和对应的有差异curRow返回
      if (diffRowIndex === -1) {
        diffList.push(curRow)
      }
    }

    return diffList
  }, [])
}

/**
 * @description: Diff出curList和sourceList不同的Row
 * @param {Array} arr1 源数据
 * @param {Array} arr2 当前数据
 * @param {Array} filterFields 过滤不比较的字段
 * @return {List}
 * @Date Changed:
 */
export function getArrDifSameValue(arr1, arr2, filterFields) {
  const result = []
  let isExist = false
  for (let i = 0; i < arr2.length; i++) {
    const curObj = arr2[i]
    // 新增数据不做Diff
    if (!curObj.id) continue
    isExist = false
    for (let j = 0; j < arr1.length; j++) {
      const sourceObj = arr1[j]
      // 没有id不做Diff
      if (!sourceObj.id) continue
      if (isEqual(curObj, sourceObj, filterFields)) {
        isExist = true
        break
      }
    }
    if (!isExist) {
      result.push(curObj)
    }
  }
  return result
}

// 如果试图中有所选内容不触发点击事件
export function isTrigger(event) {
  let getSelection = () => {}
  if (!event) {
    getSelection = window.getSelection
  } else {
    getSelection = event.view.getSelection
  }

  // 如果有内容返回试图所选内容，没有就是空
  return (getSelection().toString()).trim()
}

/**
 * @description: 校验分录附件列表一旦某个字段上传，其他不能为空
 * @param {*}
 * @return {*}
 * @Date Changed:
 */
export function validateTable(tables, fields) {
  // 没有数据默认过校验
  if (!tables.length) return true
  return tables.every(i => {
    return fields.every(f => i[f])
  })
}

/**
 * @description: 函数节流-定时器方案
 * @param {Function} fn
 * @param {Number} wait
 * @return {Function} 节流fn
 * @Date Changed:
 */
export function throttle(fn, wait) {
  var timer = null
  return function() {
    var context = this
    var args = arguments
    if (!timer) {
      timer = setTimeout(function() {
        fn.apply(context, args)
        timer = null
      }, wait)
    }
  }
}

/**
 * @description: 合计Array指定字段数据
 * @param {Array} list 合计的Array
 * @param {Array} amountField 要合计的字段
 * @param {Function} operate 根据什么操作符进行合计
 * @return {Object} 合计好的数据汇总
 * @Date Changed:
 */
export function calcArrayTotal(list = [], amountField = [], operate) {
  if (!list.length && !amountField.length) {
    return new Error('arg1 And arg2 must Array !')
  }
  const retObj = amountField.reduce((obj, f) => {
    obj[f] = 0
    return obj
  }, {})
  return list.reduce((retObj, i) => {
    amountField.map(f => (retObj[f] = operate(retObj[f], i[f] || 0)))
    return retObj
  }, retObj)
}

/**
     * @description: 删除指定数据
     * @param {Object} mode 对象
     * @param {Array} listFiled 分录字段
     * @param {Array} delKeys 要删除的字段
     * @return {*}
     * @Date Changed:
*/
export function deleteId(mode, listFileds, delKeys = []) {
  listFileds.reduce((newList, field) => {
    const newVal = Array.isArray(mode[field]) && mode[field].map(i => {
      delKeys.forEach(key => delete i[key])
      return i
    })
    newList[field] = (Array.isArray(newVal) && newVal) || []
    return newList
  }, {})
  return mode
}

export function disabledFormOptions(formOptions, fields, isDisabled = true) {
  formOptions.forEach((i) => {
    if (fields.includes(i.key)) {
      this.$set(i, 'disabled', isDisabled)
    }
  })
}

// 查找表单项
export function findFormItem(formOptions, fields, keyField = 'key') {
  let symbol = 'find'
  switch (fields) {
    case Array.isArray(fields):
      symbol = 'filter'
      break
  }
  return formOptions[symbol]((i) => {
    if (symbol === 'find') return i[keyField] === fields
    if (fields.includes(i[keyField])) {
      return true
    }
  })
}
export function setFormOptions(formOptions, fields, setKey, setVal) {
  formOptions.forEach((i) => {
    if (fields.includes(i.key)) {
      this.$set(i, setKey, setVal)
    }
  })
}

export function removeFormOptions(formOptions, fields, removeKey) {
  formOptions.forEach((i) => {
    if (fields.includes(i.key)) {
      this.$delete(i, removeKey)
    }
  })
}

/**
 * @description: 将数组拼接String
 * @param {Array} arr 要拼接成字段串的数组
 * @param {String} joinKey：如果数组项是对象类型，根据对象的哪个key对应的值进行拼接
 * @return {String}
 */
export function joinArrayVal(arr = [], joinKey = 'id') {
  return arr.reduce((str, i) => {
    str += `${isObject(i) ? i[joinKey] : i},`
    return str
  }, '').slice(0, -1)
}
const isObjectOrArray = (val) => Array.isArray(val) || isObject(val)

/**
 * @description: 将数组拼接String
 * @param {Object} params 将Object类型拼接queryUrl a=1&b=11
 * @return {String}
 */
export function generatorURL(params = {}, isAsk = true) {
  if (Array.isArray(params)) return joinArrayVal(params)
  return Object.entries(params).reduce((urlStr, [key, val]) => {
    urlStr += `${key}=${isObjectOrArray(val) ? generatorURL(val) : val}&`
    return urlStr
  }, isAsk ? '?' : '').slice(0, -1)
}
/**
 * 格式化时间到[天，时，分，秒] 取最大时间显示
 * @param {Number} size 时间大小
 */
export function formatTime2Day(size) {
  if (size === null || size === undefined) {
    return ''
  }
  if (isNaN(Number(size))) return ''
  const dayTime = 24 * 60 * 60000
  if (size >= dayTime) {
    return Math.ceil(size / dayTime) + '天'
  } else if (size > (60 * 60000)) {
    return Math.ceil(size / 24 / 60000) + '小时'
  } else if (size > 6000) {
    return Math.ceil(size / 60000) + '分钟'
  }
  return Math.ceil(size / 1000) + '秒'
}

// 深度合并对象
export function deepObjectMerge(firstObj, secondObj) {
  for (var key in secondObj) {
    firstObj[key] = firstObj[key] && firstObj[key].toString() === '[object Object]'
      ? deepObjectMerge(firstObj[key], secondObj[key])
      : firstObj[key] = secondObj[key]
  }
  return firstObj
}

// 千分位
export function formatThouPercentile(num) {
  return (num + '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,')
}

/**
   * @description: 将多个函数转换为链式，通过next确定要不要执行下一个CallBack
   * @param {Function} fns 函数列表
   * @param {Number} calledIndex 从第几个函数开始
   * @return {*}
   */
export function chainCallBacks(fns, calledIndex = 0) {
  const next = () => {
    const fn = fns[calledIndex++]
    calledIndex === fns.length ? fn() : fn(next)
  }
  next()
}

