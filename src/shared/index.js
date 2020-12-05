/* eslint-disable */
function emptyAction() {
  // 警告：提示当前使用的是空 Action
  console.warn("Current execute action is empty!");
}

class Shared {
  // 默认值为空 Action
  bus = {
    on: emptyAction,
    off: emptyAction,
    emit: emptyAction
  };
  // 设置全局事件通知
  setBus(bus) {
    this.bus = bus
  }
  // 设置父组件vuex状态管理
  setStore(store) {
    this.store = store
  }
  // 设置子应用名
  setName(name) {
    this.name = name
  }
  // 获取子应用名
  getName() {
    return this.name
  }
  init(props) {
    this.setBus(props.bus)
    this.setStore(props.store)
    this.setName(props.name)
  }
  commit(type, data, isFullType = false) {
    // 默认vuex传递microApp 微应用模块
    let _type = isFullType ? type :  'microApp/' + type
    this.store.commit(_type, data)
  }
  dispatch(type, data, isFullType = false) {
    // 默认vuex传递microApp 微应用模块
    let _type = isFullType ? type :  'microApp/' + type
    this.store.dispatch(_type, data)
  }
  commitRoutes(routes) {
    this.commit('CHANGE_ROUTES', {
      name: this.name,
      routes: routes
    })
  }
  /**
   * 监听
   */
  on(...args) {
    if (!this.bus || !this.bus.on) return
    return this.bus.on(...args);
  }
  /**
   * 派发
   */
  emit(...args) {
    if (!this.bus || !this.bus.emit) return
    return this.bus.emit(...args);
  }
  /**
   * 卸载
   */
  off(...args) {
    if (!this.bus || !this.bus.off) return
    return this.bus.off(...args);
  }
}

const shared = new Shared();
export default shared;