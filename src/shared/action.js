class Action {
  store = null
  events = []
  constructor(props = {}) {
    if (self !== top) {
      this.mode = 'iframe'
      window.addEventListener('message', (e) => {
        this.handleMessage(e)
      })
    } else if (window.__POWERED_BY_QIANKUN__) {
      this.mode = 'qiankun'
    } else {
      return
    }
    this.mode = props.mode || 'iframe'
    this.store = props.store
    this.props = props
    this.bus = props.bus
    this.routeMode = props.routeMode
  }
  postMessage(msg, data) {
    if (!this.mode) {
      return
    }
    if (this.bus) {
      if (typeof msg === 'object') {
        this.bus.emit(msg.type, msg.data)
      } else {
        this._postMessage(msg, data)
      }
    }
  }
  onMessage(type, handle) {
    if (!this.mode) {
      return
    }
    if (this.bus) {
      this.bus.on(type, handle)
    } else {
      // window.addEventListener('message', handle)
      this.events.push({
        type, handle
      })
    }
  }
  handleMessage(e) {
    let type = e.data
    let data = null
    if (typeof e.data === 'object') {
      type = e.data.type
      data = e.data.data
    }
    const event = this.events.find(event => event.type === type)
    if (event && event.handle) {
      event.handle(data)
    }
  }
  removeMessage(type, handle) {
    if (this.bus) {
      this.bus.off(type, handle)
    } else {
      // window.removeEventListener('message', handle)
      const index = this.events.findIndex(event => event.type === type)
      if (index !== -1) {
        this.events.splice(index, 1)
      }
    }
  }
  _postMessage(msg, origin = '*') {
    let data = {
      name: window.name
    }
    if (typeof msg === 'object') {
      data = Object.assign({}, data, msg)
    } else {
      data.msg = msg
    }
    try {
      window.parent.postMessage(data, origin)
    } catch (error) {
      window.parent.postMessage(data, '*')
    }
  }
  commit(type, data, isFullType = false) {
    // 默认vuex传递microApp 微应用模块
    const _type = isFullType ? type : 'microApp/' + type
    this.store.commit(_type, data)
  }
  dispatch(type, data, isFullType = false) {
    // 默认vuex传递microApp 微应用模块
    const _type = isFullType ? type : 'microApp/' + type
    this.store.dispatch(_type, data)
  }
  /**
   * 监听
   */
  on(...args) {
    if (!this.bus || !this.bus.on) return
    return this.bus.on(...args)
  }
  /**
   * 派发
   */
  emit(...args) {
    if (!this.bus || !this.bus.emit) return
    return this.bus.emit(...args)
  }
  /**
   * 卸载
   */
  off(...args) {
    if (!this.bus || !this.bus.off) return
    return this.bus.off(...args)
  }
}
let action = new Action()
export default action

export function createAction(prop) {
  if (action && prop) {
    action = new Action(prop)
    return action
  }
  action = new Action(prop)
  return action
}
