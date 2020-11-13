<template>
  <div class="login-container">
    <div class="login-form">
      <div class="title-container">
        <h3 class="title">电子书管理系统</h3>
      </div>
      <dynamic-form
        labelWidth="0px"
        :formConfig="formConfig"
        v-model="loginForm"
        ref="loginForm"
        :showBtn="false"
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
        登录</el-button
      >
    </div>
    <author></author>
  </div>
</template>

<script>
// 引入自己二次封装的表单
import "@/components/dynamic-form";
import Author from './components/Author.vue'

export default {
  name: "Login",
  components: {Author},
  data() {
    const validatePassword = (rule, value, callback) => {
      let testUserNameReg = /^[-!@#$%^&*()_]/g;
      if (testUserNameReg.test(value)) {
        callback(new Error("用户名不能已特殊字符开头"));
      } else {
        callback();
      }
    };
    return {
      passwordRules: [{ required: true, trigger: "blur", message: "密码必填" }],
      formConfig: {
        formItemList: [
          {
            key: "username",
            type: "input",
            icon: "user",
            placeholder: "请输入用户名",
            rules: [
              { required: true, trigger: "blur", message: "请输入正确用户名" },
              { required: true, trigger: "blur", validator: validatePassword }
            ]
          }
        ]
      },
      loginForm: {
        username: "",
        password: ""
      },
      passwordType: "password",
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query;
        if (query) {
          this.redirect = query.redirect;
          this.otherQuery = this.getOtherQuery(query);
        }
      },
      immediate: true
    }
  },
  mounted() {
    let userInfo = {
      name: "ks"
    };
   this.localStorage.setItem('userInfo', userInfo)
   this.localStorage.setItem('age', 18, 'userInfo')
    if (this.loginForm.username === "") {
      this.$refs.loginForm.$el[0].focus();
    } else if (this.loginForm.password === "") {
      this.$refs.loginForm.$el[1].focus();
    }
  },
  methods: {
    checkCapslock(e) {
      const { key } = e;
      this.capsTooltip = key && key.length === 1 && key >= "A" && key <= "Z";
    },
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.$refs['dynamicForm'].validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({
                path: this.redirect || "/",
                query: this.otherQuery
              });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      }, {});
    }
  }
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
    background: yellow;
  }
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
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

  ::v-deep .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
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

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
