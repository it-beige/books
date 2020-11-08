<template>
  <el-form
    :model="value"
    :ref="refName"
    :label-width="labelWidth"
    class="dynamic-form"
    :class="{ 'is-look': disabled }"
  >
    <el-row :gutter="space" :span="24" class="form-item">
      <el-col
        v-for="item in options"
        :key="item.key"
        v-show="formItemHidden(item.hidden)"
        :md="item.span || itemSpanDefault"
        :xs="xsSpan"
        :offset="item.offset || 0"
      >
        <dynamic-form-item
          class="item"
          :allDisabled="allDisabled"
          :ref="item.type"
          :item="item"
          v-bind="item"
          :value="value[item.key]"
          :disabled="disabled"
          :style="{'min-width': columnMinWidth }"
          @input="handleInput($event, item.key)"
          @changeSelect="changeSelect"
          @uploadSuccess="uploadSuccess"
        ></dynamic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="space">
      <el-col :span="24">
        <div class="slot-box">
          <slot></slot>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="space">
      <el-col :span="24">
        <el-form-item v-if="showBtn && !disabled" class="form-bottom-box">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <!-- <el-button @click="resetForm">重置</el-button> -->
          <el-button @click="cancelForm">取消</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { deepClone } from "@/utils";

export default {
  props: {
    refName: {
      type: String,
      default: "dynamicForm",
    },
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
      default: "80px"
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
      type: String
    }
  },
  provide() {
    return {
      formThis: this
    };
  },
  watch: {
    formConfig: {
      handler() {
        this.initConfig();
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      xsSpan: 24,
      itemSpanDefault: 24,
      options: [],
      cascadeMap: new Map(),
      hasInitCascadeProps: [],
      allDisabled: false,
    };
  },
  methods: {
    uploadSuccess(attachmentData) {
      this.$emit('uploadSuccess', attachmentData)
    },
    itemClass(item) {
      return item.disabled
        ? {'margin-left': '0'}
        : {'margin-left': '13px'}
    },
    initConfig() {
      if (this.formConfig.allDisabled) {
        this.allDisabled = true;
      }
      this.formConfig.formItemList.forEach((item, index) => {
        if (item.hasOwnProperty("cascade")) {
          const ob = {
            index: index,
            url: item.url,
            key: item.key,
            multiple: item.multiple
          };
          this.cascadeMap.set(item.cascade, ob);
        }
      });
      this.options = deepClone(this.formConfig.formItemList);
      this.setDefaultValue();
    },
    handleInput(val, key) {
      this.$emit("input", { ...this.value, [key]: val });
      this.handlerCascade(val, key);
    },
    changeSelect(key) {
      this.$emit('changeSelect', key)
    },
    handlerCascade(val, key) {
      if (this.cascadeMap.has(key)) {
        const obj = this.cascadeMap.get(key);
        this.value[obj.key] = obj.multiple ? [] : "";
        if (val) {
          const object = deepClone(this.formConfig.formItemList[obj.index]);
          Object.keys(object.params).forEach(key => {
            if (!object.params[key]) {
              object.params[key] = val;
            }
          });
          this.$set(this.options, obj.index, object);
        }
        this.handlerCascade("", obj.key);
      }
    },

    initCascadeOptions(val, key) {
      if (this.cascadeMap.has(key)) {
        const obj = this.cascadeMap.get(key);
        if (this.hasInitCascadeProps.includes(obj.key)) return;
        if (val) {
          const object = deepClone(this.formConfig.formItemList[obj.index]);
          Object.keys(object.params).forEach(key => {
            if (!object.params[key]) {
              object.params[key] = val;
            }
          });
          this.$set(this.options, obj.index, object);
          this.hasInitCascadeProps.push(obj.key);
        }
      }
    },
    setDefaultValue() {
      const formData = { ...this.value };
      // 设置默认值
      this.options.forEach(item => {
        const { key, value } = item;
        if (formData[key] === undefined || formData[key] === null) {
          formData[key] = value;
        }
        if (formData[key]) {
          this.initCascadeOptions(formData[key], key);
        }
      });
      this.$emit("input", { ...formData });
    },
    /**
     *  表单验证提交
     */
    submitForm(state) {
      this.$refs[this.refName].validate(valid => {
        if (valid) {
          this.handleSubmit();
        } else {
          return false;
        }
      });
    },
    /**
     * 表单重置
     */
    resetForm() {
      this.options.forEach(item => {
        const key = item.key;
        this.value[key] = item.value;
      });
      if (this.$refs.treeSelect) {
        this.$refs.treeSelect.forEach(e => {
          e.$refs.treeSelect.clearHandler();
        });
      }
      this.$forceUpdate();
    },
    /**
     * 取消表单
     */
    cancelForm() {
      this.$emit("cancelForm", false);
    },
    handleSubmit(state) {
      this.$emit("submit", this.value, state);
    },
    formItemHidden(hidden) {
      if (typeof hidden === "boolean") {
        return !hidden;
      } else if (hidden instanceof Object) {
        const key = Object.keys(hidden)[0];
        const val = hidden[key];
        const formVal = this.value[key];
        if (formVal instanceof Array) {
          if (val instanceof Array) {
            for (let i = 0; i < val.length; i++) {
              if (formVal.includes(val[i])) {
                return false;
              }
            }
          }
          return !formVal.includes(val);
        }
        if (val instanceof Array) {
          return !val.includes(formVal);
        }
        return formVal !== val;
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.dynamic-form {
  ::v-deep  textarea {
    font-family: "PingFang SC", "Helvetica Neue", Helvetica, "microsoft yahei",
      arial, STHeiTi, sans-serif;
  }
  ::v-deep  .el-input {
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
  ::v-deep  .el-checkbox-group {
    .el-checkbox {
      margin-right: 10px;
    }
  }
  ::v-deep  .el-radio-group {
    .el-radio {
      margin-right: 10px;
    }
  }
  ::v-deep  .el-date-editor--date {
    ::v-deep  .el-input__inner {
      padding: 0 15px 0 30px !important;
    }
  }
  ::v-deep  .el-select {
    width: 100% !important;
    ::v-deep  .el-input__inner {
      padding: 0 30px 0 15px;
    }
  }
  ::v-deep  .all-disabled {
    background: #f5f5f5;
    border: 1px solid #dcdcdc;
    border-radius: 3px;
    margin-left: 13px;
  }

  .slot-box {
    width: 100%;
  }
  .form-bottom-box {
    text-align: right;
  }
}

.is-look {

    ::v-deep  .el-form-item__label {
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
  /*::v-deep  .el-input__inner, ::v-deep  .el-textarea__inner {*/
  /*  padding-left: 0 !important;*/
  /*}*/
}
</style>
