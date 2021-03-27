import Cookies from 'js-cookie'

const TokenKey = 'book-token'
const APP_ID_KEY = `ldp_${process.env.VUE_APP_ID}_appid`

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setAppId(appid) {
  return Cookies.set(APP_ID_KEY, appid)
}

export function getAppId() {
  const appid = Cookies.get(APP_ID_KEY)
  return appid
}

export function removeAppId() {
  return Cookies.remove(APP_ID_KEY)
}

// 清除首屏加载的loading
export function closeLoading() {
  const loading = document.getElementById('app-loading')
  if (loading) {
    loading.remove()
  }
}

// 获取用户 token & appid
export function getLoginData() {
  return {
    token: getToken(),
    appid: getAppId()
  }
}
