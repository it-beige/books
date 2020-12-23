<template>
  <div class="social-signup-container">
    <div class="sign-btn" @click="wechatHandleClick('wechat')">
      <span class="wx-svg-container"><svg-icon icon-class="wechat" class="icon" /></span>
      WeChat
    </div>
    <div class="sign-btn" @click="tencentHandleClick('tencent')">
      <span class="qq-svg-container"><svg-icon icon-class="qq" class="icon" /></span>
      QQ
    </div>
    <div class="sign-btn" @click="gitHubHandleClick('gitBuh')">
      <span class="github-svg-container"><svg-icon icon-class="github" class="icon" /></span>
      gitHub
    </div>
  </div>
</template>

<script>
import openWindow from '@/utils/open-window'

export default {
  name: 'SocialSignin',
  methods: {
    wechatHandleClick(thirdpart) {
      alert('ok')
      // this.$store.commit('SET_AUTH_TYPE', thirdpart)
      // const appid = 'xxxxx'
      // const redirect_uri = encodeURIComponent('xxx/redirect?redirect=' + window.location.origin + '/auth-redirect')
      // const url = 'https://open.weixin.qq.com/connect/qrconnect?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_login#wechat_redirect'
      // openWindow(url, thirdpart, 540, 540)
    },
    tencentHandleClick(thirdpart) {
      // this.$store.commit('SET_AUTH_TYPE', thirdpart)
      const client_id = 'xxxx' // 05f76b168d4b2550733ffe6fa7b996f9
      const redirect_uri = encodeURIComponent('xxx/redirect?redirect=' + window.location.origin + '/auth-redirect')
      const url = 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirect_uri
      // openWindow(url, thirdpart, 540, 540)
    },
    gitHubHandleClick(thirdpart) {
      // 准备参数
      // const client_id = 'Iv1.xxxxxx'
      // // const redirect_uri = encodeURIComponent('http://book.beige.world/#/login')
      // const redirect_uri = encodeURIComponent('http://localhost:9527/#/login')
      // const url = 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&redirect_uri=' + redirect_uri
      // openWindow(url, thirdpart, 540, 540)

      // this.$store.commit('user/SET_AUTH_TYPE', thirdpart)
    }
  }
}
</script>

<style lang="scss" scoped>
  .social-signup-container {
    margin: 20px 0;
    .sign-btn {
      display: inline-block;
      cursor: pointer;
    }
    .icon {
      color: #fff;
      font-size: 24px;
      margin-top: 8px;
    }
    .wx-svg-container,
    .qq-svg-container,
    .github-svg-container {
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      padding-top: 1px;
      border-radius: 4px;
      margin-bottom: 20px;
      margin-right: 5px;
    }
    .wx-svg-container {
      background-color: #24da70;
    }
    .qq-svg-container {
      background-color: #6BA2D6;
      margin-left: 50px;
    }
    .github-svg-container {
      background-color: #bdc3c37a;
      margin-left: 50px;
    }
  }
</style>
