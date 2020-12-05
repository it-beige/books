<template>
  <div class="login-container" :style="{'background': `url(${bgImg})`}">
    <div class="login-form">
      <img :src="loginImg" class="login-img">
      <div class="form">
        <div class="title-container">
          <h3 class="title">电子书管理系统</h3>
        </div>
        <dynamic-form
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
          </slot>
        </dynamic-form>
        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;margin-bottom:30px;padding-left: 10x; padding-right: 10px"
          @click.native.prevent="handleLogin"
        >
          登录
        </el-button>
      </div>
    </div>
    <Author />
  </div>
</template>

<script>
// 引入自己二次封装的表单
import '@/components/dynamic-form'
import Author from './Author'

export default {
  name: 'Login',
  components: { Author },
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
      passwordRules: [{ required: true, trigger: 'blur', message: '密码必填' }],
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
          }
        ]
      },
      loginForm: {
        username: 'admin',
        password: 'admin'
      },
      bgImg: require('@/assets/login/bg.png'),
      loginImg: require('@/assets/login/login.png'),
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    // this.$nextTick(() => {
    //   console.log(this.$store)
    // })
    const userInfo = {
      name: 'ks'
    }
    this.localStorage.setItem('userInfo', userInfo)
    this.localStorage.setItem('age', 18, 'userInfo')
    if (this.loginForm.username === '') {
      this.$refs.loginForm.$el[0].focus()
    } else if (this.loginForm.password === '') {
      this.$refs.loginForm.$el[1].focus()
    }
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
    handleLogin() {
      this.$refs.loginForm.$refs['dynamicForm'].validate(valid => {
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
      margin: 55px 0 55px;
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

.login-container ::v-deep {
  .el-form-item__content {
      display: flex;
      align-items: center;
    }
  .svg-container {
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

}
</style>
