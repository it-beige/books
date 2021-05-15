<template>
  <div class="social-signup-container">

    <div class="sign-btn" @click="tencentHandleClick('tencent')">
      <span class="qq-svg-container"><svg-icon icon-class="qq" class="icon tencent" /></span>
      QQ
    </div>
    <div class="sign-btn" @click="gitHubHandleClick('gitHuh')">
      <span class="github-svg-container"><svg-icon icon-class="github" class="icon gitHuh" /></span>
      gitHub
    </div>
    <div class="sign-btn" @click="giteeHandleClick('gitee')">
      <span class="gitee-svg-container"><svg-icon icon-class="gitee" class="icon gitee" /></span>
      gitee
    </div>
    <div class="sign-btn" @click="baiduHandleClick('baidu')">
      <span class="baidu-svg-container"><svg-icon icon-class="baidu" class="icon baidu" /></span>
      百度
    </div>
    <div v-if="false" class="sign-btn" @click="oschinaHandleClick('oschina')">
      <span class="oschina-svg-container"><svg-icon icon-class="oschina" class="icon oschina" /></span>
    </div>
  </div>
</template>

<script>
// import openWindow from '@/utils/open-window'

export default {
  name: 'SocialSignin',
  data() {
    return {
      curThirdpart: '', // 第三方应用
    }
  },
  methods: {
    wechatHandleClick(thirdpart) {

    },
    tencentHandleClick(thirdpart) {

    },
    gitHubHandleClick(thirdpart) {
      // 准备参数
      const clientId = 'Iv1.243cc65a0c47f657'
      const redirectUri = 'http://localhost:9527/login'
      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`
      this.localStorage.setItem('authType', thirdpart)
      window.location.href = url
    },
    giteeHandleClick(thirdpart) {
      // 准备参数
      const clientId = 'e9c3233a5e2863c1ac6d82c82e1b64119429bae4c00e7b30e46571ad136f505d'
      const redirectUri = 'http://localhost:9527/login'
      const url = `https://gitee.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
      this.localStorage.setItem('authType', thirdpart)
      window.location.href = url
      // openWindow(url, thirdpart, 540, 540)
    },
    baiduHandleClick(thirdpart) {
      // 准备参数
      const clientId = 'uEYaSmr5RfS9Gj1MrWiw01jq'
      const redirectUri = 'http://localhost:9527/login'
      const url = `https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`
      this.localStorage.setItem('authType', thirdpart)
      window.location.href = url
      // window.open(
      //   url,
      //   '_blank',
      //   'toolbar=no,width=800, height=600'
      // )
    },
    oschinaHandleClick(thirdpart) {
      // 暂时还没有
      // 准备参数

    },
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
      font-size: 24px;
      margin-top: 8px;
    }
    .wx-svg-container,
    .qq-svg-container,
    .github-svg-container,
    .gitee-svg-container,
    .baidu-svg-container,
    .oschina-svg-container{
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      padding-top: 1px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .wx-svg-container {
      // background-color: #24da70;
    }
    .qq-svg-container {
      margin-left: 50px;
    }
    .github-svg-container {
      margin-left: 50px;
    }
    .gitee-svg-container {
      margin-left: 50px;
    }
    .baidu-svg-container {
      margin-left: 50px;
    }
    .oschina-svg-container {

      .oschina {
        font-size: 22px;
        transform: scale(3);
      }
      margin-left: 50px;
    }
  }
</style>
