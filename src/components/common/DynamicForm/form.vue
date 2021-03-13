<template>
  <el-form
    :ref="refName"
    :model="value"
    :label-width="labelWidth"
    v-bind="formConfig"
    class="dynamic-form"
    :class="{'is-look': disabled}"
  >
    <el-row :gutter="space" :span="24" class="form-item">
      <el-col
        v-for="item in options"
        v-show="formItemHidden(item.hidden)"
        :key="item.key"
        :md="item.span || itemSpanDefault"
        :xs="xsSpan"
        :offset="item.offset || 0"
      >
        <dynamic-form-item
          :ref="item.type"
          :item="item"
          v-bind="item"
          :value="value[item.key]"
          :style="{'min-width':columnMinWidth}"
          :disabled="disabled"
          @input="handleInput($event, item.key)"
          @getFileId="getFileId"
          @modelItem="modelItem"
          @controlDataChange="controlDataChange"
          @getProjectId="getProjectId"
          @getProjectNode="getProjectNode"
          @getContent="getContent"
          @asyncOptions="asyncOptions"
          @handleFocusEvent="handleFocusEvent"
        />
      </el-col>
    </el-row>
    <el-row :gutter="space">
      <el-col :span="24">
        <div class="slot-box">
          <slot />
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="space">
      <el-col :span="24">
        <el-form-item v-if="showBtn && !disabled" class="form-bottom-box">
          <el-button v-if="showSaveBtn" @click="saveForm">保存</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <!-- <el-button @click="resetForm">重置</el-button> -->
          <el-button @click="cancelForm">取消</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { deepClone } from '@/utils'

export default {
  name: 'DynamicForm',
  props: {
    formConfig: {
      type: Object,
      required: true
    },
    disabled: Boolean, // 是否禁用
    value: {
      type: Object,
      required: true
    },
    labelWidth: {
      type: String,
      default: '80px'
    },
    showBtn: {
      type: Boolean, // 是否显示表单内置按钮
      default: true
    },
    space: {
      type: Number, // 表单单元格间距
      default: 20
    },
    columnMinWidth: {
      type: String,
      default: ''
    },
    showSaveBtn: Boolean
  },
  data() {
    return {
      refName: 'DynamicForm',
      xsSpan: 24,
      itemSpanDefault: 24,
      options: [],
      cascadeMap: new Map(),
      hasInitCascadeProps: []
    }
  },
  watch: {
    formConfig: {
      handler() {
        this.initConfig()
      },
      deep: true,
      immediate: true
    }
  },
  provide() {
    return {
      formThis: this
    }
  },
  methods: {
    getFileId(data) {
      this.$emit('getFileId', data)
    },
    modelItem(val) {
      this.$emit('modelItem', val)
    },
    controlDataChange(val) {
      this.$emit('controlDataChange', val)
    },
    getProjectId(data) {
      this.$emit('getProjectId', data)
    },
    getProjectNode(data) {
      this.$emit('getProjectNode', data)
    },
    getContent(data) {
      this.$emit('getContent', data)
    },
    asyncOptions(options) {
      this.$emit('asyncOptions', options)
    },
    handleFocusEvent(key) {
      this.$emit('handleFocusEvent', key)
    },
    initConfig() {
      this.formConfig.formItemList.forEach((item, index) => {
        if (Object.prototype.hasOwnProperty.call(item, 'cascade')) {
          const ob = {
            index: index,
            url: item.url,
            key: item.key,
            multiple: item.multiple
          }
          this.cascadeMap.set(item.cascade, ob)
        }
      })
      this.options = deepClone(this.formConfig.formItemList)
      this.setDefaultValue()
    },
    handleInput(val, key) {
      this.$emit('input', { ...this.value, [key]: val })
      this.handlerCascade(val, key)
    },
    handlerCascade(val, key) {
      if (this.cascadeMap.has(key)) {
        const obj = this.cascadeMap.get(key)
        // this.value[obj.key] = obj.multiple ? [] : ''
        this.$nextTick(() => {
          this.$emit('input', {
            ...this.value,
            [obj.key]: obj.multiple ? [] : ''
          })
        })
        if (val) {
          const object = deepClone(this.formConfig.formItemList[obj.index])
          if (Object.prototype.hasOwnProperty.call(object, 'extendParams')) {
            Object.keys(object.extendParams).forEach(key => {
              if (!object.extendParams[key]) {
                object.extendParams[key] = val[object.props.value]
              }
            })
          } else {
            Object.keys(object.params).forEach(key => {
              if (!object.params[key]) {
                object.params[key] = val
              }
            })
          }
          this.$set(this.options, obj.index, object)
        }
        this.handlerCascade('', obj.key)
      }
    },

    initCascadeOptions(val, key) {
      if (this.cascadeMap.has(key)) {
        const obj = this.cascadeMap.get(key)
        if (this.hasInitCascadeProps.includes(obj.key)) return
        if (val) {
          const object = deepClone(this.formConfig.formItemList[obj.index])
          Object.keys(object.params).forEach(key => {
            if (!object.params[key]) {
              object.params[key] = val
            }
          })
          this.$set(this.options, obj.index, object)
          this.hasInitCascadeProps.push(obj.key)
        }
      }
    },
    setDefaultValue() {
      const formData = { ...this.value }
      // 设置默认值
      this.options.forEach(item => {
        const { key, value } = item
        if (formData[key] === undefined || formData[key] === null) {
          formData[key] = value
        }
        if (formData[key]) {
          this.initCascadeOptions(formData[key], key)
        }
      })
      this.$emit('input', { ...formData })
    },
    /**
       *  表单验证提交
       */
    submitForm(state) {
      this.$refs[this.refName].validate(valid => {
        if (valid) {
          this.handleSubmit()
        } else {
          return false
        }
      })
    },

    validate() {
      return new Promise((resolve, reject) => {
        this.$refs[this.refName].validate((valid, obj) => {
          if (valid) {
            resolve(this.value)
          } else {
            reject('校验失败')
          }
        })
      })
    },

    clearValidate(prop) {
      if (prop) {
        this.$refs[this.refName].clearValidate(prop)
      } else {
        this.$refs[this.refName].clearValidate()
      }
    },

    /**
       * 表单重置
       */
    resetForm() {
      this.options.forEach(item => {
        const key = item.key
        this.value[key] = item.value
      })
      if (this.$refs.treeSelect) {
        this.$refs.treeSelect.forEach(e => {
          e.$refs.treeSelect.clearHandler()
        })
      }
      this.$forceUpdate()
    },
    /**
       * 取消表单
       */
    cancelForm() {
      this.$emit('cancelForm', false)
    },
    /**
       * 提交表单
       * @param state
       */
    handleSubmit(state) {
      this.$emit('submit', this.value, state)
    },
    /**
       * 保存表单
       * @param state
       */
    saveForm(state) {
      this.$emit('save', this.value, state)
    },
    formItemHidden(hidden) {
      if (typeof hidden === 'boolean') {
        return !hidden
      } else if (hidden instanceof Object) {
        const key = Object.keys(hidden)[0]
        const val = hidden[key]
        const formVal = this.value[key]
        if (formVal instanceof Array) {
          if (val instanceof Array) {
            for (let i = 0; i < val.length; i++) {
              if (formVal.includes(val[i])) {
                return false
              }
            }
          }
          return !formVal.includes(val)
        }
        if (val instanceof Array) {
          return !val.includes(formVal)
        }
        return formVal !== val
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
  .dynamic-form {
    padding: 10px;

    ::v-deep textarea {
      font-family: "PingFang SC", "Helvetica Neue", Helvetica, "microsoft yahei",
      arial, STHeiTi, sans-serif;
    }

    ::v-deep .el-input {
      .el-input__inner {
        /*padding-right: 15px;*/
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
      }

      input[type="number"] {
        -moz-appearance: textfield;
      }
    }

    ::v-deep .el-checkbox-group {
      .el-checkbox {
        margin-right: 10px;
      }
    }

    ::v-deep .el-radio-group {
      .el-radio {
        margin-right: 10px;
      }
    }

    ::v-deep .el-date-editor--date {
      ::v-deep .el-input__inner {
        padding: 0 15px 0 30px !important;
      }
    }

    ::v-deep .el-select {
      width: 100% !important;

      ::v-deep .el-input__inner {
        padding: 0 30px 0 15px;
      }
    }

    .slot-box {
      width: 100%;
    }

    .form-bottom-box {
      text-align: right;
    }
  }

  .is-look {
    ::v-deep .el-form-item__label {
      color: #999;
      font-weight: 400;
      padding-right: 0;

      &::before {
        content: " " !important;
      }

      &::after {
        content: ":" !important;
      }
    }

    /*::v-deep .el-input__inner, ::v-deep .el-textarea__inner {*/
    /*  padding-left: 0 !important;*/
    /*}*/
  }
</style>
