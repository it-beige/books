import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 清除首屏加载的loading
export function closeLoading() {
  const loading = document.getElementById('app-loading')
  if (loading) {
    loading.remove()
    // document.body.removeChild(loading)
  }
}
