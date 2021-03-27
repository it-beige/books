<template>
  <div class="login-container" :style="{'background': `url(${bgImg})`}">
    <div class="login-form">
      <img :src="loginImg" class="login-img">
      <div class="form">
        <div class="title-container">
          <h3 class="title">电子书管理系统</h3>
          <transition
            enter-active-class="animate__animated animate__tada"
            leave-active-class="animate__animated animate__bounceOutRigh"
            :duration="{enter:5000,leave:500}"
          >
            <div v-if="codeIcon === 'code2' && isClickLogin" class="text-error">
              <span>验证码不正确</span>
            </div>
          </transition>
        </div>
        <DynamicForm
          ref="loginForm"
          v-model="loginForm"
          label-width="0px"
          :form-config="formConfig"
          :show-btn="false"
        >
          <slot name="slot-box">
            <el-form-item prop="password" :rules="passwordRules">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                ref="password"
                :key="passwordType"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter.native="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon
                  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                />
              </span>
            </el-form-item>

            <el-form-item prop="identifyingCode" :rules="codeRules">
              <el-row :span="24">
                <el-col :span="12">
                  <el-form-item prop="identifyingCode">
                    <span class="svg-container">
                      <svg-icon :icon-class="codeIcon" :style="styleVar" />
                    </span>
                    <el-input
                      v-model="loginForm.identifyingCode"
                      placeholder="请输入验证码"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12"> <img id="imgCode" :src="codeInfo.codeSrc" alt="看不清？点击刷新" @click="getCode"></el-col>
              </el-row>

            </el-form-item>

            <el-row :span="24">
              <el-col :span="12">
                <el-button
                  :loading="loading"
                  type="primary"
                  style="width:100%;margin-bottom:30px;padding-left: 10x; padding-right: 10px"
                  @click.native.prevent="handleLogin"
                >
                  登录
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
                  第三方登录
                </el-button>
              </el-col>

            </el-row>
          </slot>
        </DynamicForm>

      </div>
    </div>
    <Author />
    <el-dialog title="第三方登录" :visible.sync="showDialog">
      你也可以扫描右侧二维码关注公号 回复：“电子书管理系统” 获取账号
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog>
  </div>
</template>

<script>
import Author from './Author'
import SocialSign from './components/SocialSignin'
import { getCookie } from '@/utils'

export default {
  name: 'Login',
  components: { Author, SocialSign },
  data() {
    const validatePassword = (rule, value, callback) => {
      const testUserNameReg = /^[-!@#$%^&*()_]/g
      if (testUserNameReg.test(value)) {
        callback(new Error('用户名不能已特殊字符开头'))
      } else {
        callback()
      }
    }
    return {
      isClickLogin: false,
      styleVar: {
        '--svgColor': '#889aa4',
      },
      showDialog: false,
      passwordRules: [{ required: true, trigger: 'blur', message: '密码必填' }],
      codeRules: [
        { required: true, trigger: 'blur', message: '验证码必填' }
      ],
      formConfig: {
        formItemList: [
          {
            key: 'username',
            type: 'input',
            icon: 'user',
            placeholder: '请输入用户名',
            rules: [
              { required: true, trigger: 'blur', message: '请输入正确用户名' },
              { required: true, trigger: 'blur', validator: validatePassword }
            ]
          },
        ]
      },
      loginForm: {
        username: 'test',
        password: 'test',
        identifyingCode: '',
      },
      bgImg: require('@/assets/login/bg.png'),
      loginImg: require('@/assets/login/login.png'),
      codeInfo: {},
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  computed: {
    codeIcon({ loginForm: { identifyingCode }, codeInfo }) {
      return getCookie(codeInfo.codeKey)?.toLowerCase() === identifyingCode?.toLowerCase() ? 'code' : 'code2'
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const execAll = [...window.location.href.matchAll(/\?code=([^#]+)/g)][0]
        // thirdpart Login
        if (execAll) {
          const {
            dispatch,
          } = this.$store
          const code = execAll[1]
          const authType = this.localStorage.getItem('authType')
          this.loginForm.username = this.$store.getters.name
          this.loginForm.password = this.$store.getters.password
          dispatch('user/thirdpartLogin', { code, authType }).then(res => {
            if (res) {
              // 跳到主页，不让url上再看到code码
              window.location.href = window.location.origin
            }
          })
        } else {
          const query = route.query
          if (query) {
            this.redirect = query.redirect
            this.otherQuery = this.getOtherQuery(query)
          }
        }
      },
      immediate: true
    }
  },
  async created() {
    this.getCode()
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && key >= 'A' && key <= 'Z'
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },

    async getCode() {
      const { data } = await this.$store.dispatch('user/getCode')
      this.codeInfo = data
    },

    handleLogin() {
      this.isClickLogin = true
      // 没过验证码校验
      if (this.codeIcon === 'code2') return
      this.$refs.loginForm.$refs['DynamicForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({
                path: this.redirect || '/',
                query: this.otherQuery
              })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'styles/variables.scss';

$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  width: 100%;
  height: 100vh;
  min-height: 100%;
  background-size: cover;
  overflow: hidden;

  .login-form {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    .login-img {
      width: 400px;
      height: 400px;
    }

    .form {
      width: 400px;
      height: 400px;
      background-color: #ffffff;
      text-align: center;
      padding: 0 40px;
      .form-item {
        width: 100%;
      }
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .title-container {
    position: relative;

    .title {
      font-family: FZLTZHUNHK--GBK1-0;
      font-size: 30px;
      color: $green;
      margin: 55px 0 35px;
    }
    .text-error {
      position: relative;
      text-align: center;
      margin: 0;
      font-size: 16px;
      color: #CD5652;
      height: 24px;
      overflow: hidden;
      word-break: break-all;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

}

.svg-container {
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

.login-container ::v-deep {
  .el-form-item__content {
      display: flex;
      // align-items: center;
    }
  .svg-container {
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

}

</style>
