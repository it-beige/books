<template>
  <el-form-item
    :class="{ 'is-look': disabled}"
    :label="item.label"
    :prop="item.key"
    :rules="item.rules"
  > 
    <span v-if="item.icon" class="svg-container">
      <svg-icon :icon-class="item.icon" />
    </span>
    <el-input
      v-if="
        ['input', 'text', 'password', 'email', 'textarea', 'number'].includes(
          item.type
        ) 
      "
      v-bind="$attrs"
      :type="item.subtype || item.type"
      :class="{'all-disabled': allDisabled}"
      v-on="$listeners"
      resize="none"
      :autosize="disabled ? true : item.autoSize || { minRows: 4, maxRows: 6 }"
      :placeholder="!isDisabled ? item.placeholder : ''"
      :disabled="isDisabled"
      @focus="handleFocusEvent(item.key)"
    >
    </el-input>

    <el-radio-group
      v-else-if="item.type === 'radio'"
      v-bind="$attrs"
      v-on="$listeners"
      :placeholder="!isDisabled ? item.placeholder : ''"
      :disabled="isDisabled"
    >
      <component
        v-for="o in item.options || asyncOptions"
        :is="item.button ? 'el-radio-button' : 'el-radio'"
        :key="o.value"
        :label="o.value"
        :disabled="o.disabled"
        :border="item.border"
        >{{ o.label }}
      </component>
    </el-radio-group>
    <el-checkbox-group
      v-else-if="item.type === 'checkbox'"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <component
        v-for="o in item.options || asyncOptions"
        :is="item.button ? 'el-checkbox-button' : 'el-checkbox'"
        :key="o.value"
        :disabled="o.disabled"
        :label="o.value"
        :border="item.border"
        >{{ o.label }}
      </component>
    </el-checkbox-group>

    <el-select
      v-else-if="item.type === 'select'"
      v-bind="$attrs"
      v-on="$listeners"
      :size="item.size"
      :multiple="item.multiple"
      :readonly="item.readonly"
      :collapse-tags="item.tags"
      :clearable="item.clearable ? false : item.clearable"
      :placeholder="!isDisabled ? item.placeholder : ''"
      :multiple-limit="item.limit"
      :disabled="isDisabled"
      @focus="handleFocusEvent(item.key)"
      @change="handleChangeEvent($event, item.key)"
    >
      <el-option
        v-for="o in mapSelectOptions(item.props, item.options || asyncOptions)"
        :key="o.value"
        :label="o.label"
        :value="o.value"
        :disabled="o.disabled"
      >
      </el-option>
    </el-select>

    <tree-select
      v-else-if="item.type === 'treeSelect'"
      ref="treeSelect"
      v-bind="$attrs"
      v-on="$listeners"
      :placeholder="!isDisabled ? item.placeholder : ''"
      :disabled="isDisabled"
      :multiple="item.multiple"
      :options="item.options || asyncOptions"
      :filterable="item.filterable"
      :clearable="item.clearable"
      :props="item.props"
      :lazy="item.lazy"
      @focus="handleFocusEvent(item.key)"
      @change="handleChangeEvent($event, item.key)"
      @loadNode="item.load($event, item.key)"
    />

    <el-switch
      v-else-if="item.type === 'switch'"
      v-bind="$attrs"
      v-on="$listeners"
    ></el-switch>
    <el-time-picker
      v-else-if="item.type === 'time'"
      :is-range="item.subtype === 'timerange' ? true : false"
      :format="item.valueFormat"
      v-bind="$attrs"
      range-separator="至"
      :start-placeholder="item.startPlaceholder"
      :end-placeholder="item.endPlaceholder"
      :readonly="item.readonly"
      :clearable="item.clearable ? false : item.clearable"
      :placeholder="!isDisabled ? item.placeholder : ''"
      :disabled="isDisabled"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
    ></el-time-picker>

    <el-date-picker
      v-else-if="item.type === 'date'"
      :type="item.subtype"
      :format="item.viewFormat || item.valueFormat"
      v-bind="$attrs"
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      v-on="$listeners"
      :disabled="isDisabled"
      @focus="handleFocusEvent(item.key)"
    ></el-date-picker>

    <form-upload
        class="upload-class"
        v-else-if="item.type === 'file'"
        v-bind="$attrs"
        v-on="$listeners"
        :disabled="disabled"
        :attachmentData="attachmentData"
        @uploadSuccess="uploadSuccess"
    >
    </form-upload>

    <dynamic-data-box
      v-else-if="item.type === 'databox'"
      v-bind="$attrs"
      v-on="$listeners"
      :valueFileld="item.valueFileld"
      :labelFileld="item.labelFileld"
      :hostUrl="item.url"
      :tableColumn="item.tableColumn"
      :entityPath="item.entityPath"
      :extendParms="item.extendParms"
      :extendSearch="item.extendSearch"
      :multiple="item.multiple"
      @focus="handleFocusEvent(item.key)"
      @change="handleChangeEvent($event, item.key)"
    >
    </dynamic-data-box>
    <template
      v-else-if="item.type === 'slot'"
    > 
      <slot :name="item.key" :data="$attrs.value"></slot>
    </template>
    <span v-else>未知控件类型</span>
  </el-form-item>
</template>
<script>
import { initData } from "@/api/data";
import TreeSelect from "@/components/tree-select/index.vue";
import FormUpload from "@/components/form-upload"
import { login } from '@/api/user';

export default {
  components: { TreeSelect, FormUpload },
  props: {
    item: {
      type: Object,
      required: true
    },
    allDisabled: Boolean,
    disabled: Boolean
  },
  inject: {
    formThis: { default: {} }
  },
  data() {
    return {
      attachmentData: [],
      asyncOptions: []
    };
  },
  computed: {
    isRange() {
      return this.subtype === "timerange";
    },
    isDisabled() {
      return this.item.disabled || this.disabled;
    }
  },
  watch: {
    "item.params": { // 传递了params就
      handler(val, oldVal) {
        if (val === undefined && oldVal === undefined) {
          return;
        }
        if (!this.isObjectEqual(val, oldVal)) {
          if (this.item.hasOwnProperty("cascade")) {
            this.getAsyncCascadeOptions(val);
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    if (!this.item.hasOwnProperty("cascade")) this.getAsyncOptions();
  },
  methods: {
    uploadSuccess(attachmentData) {
      this.$emit('uploadSuccess', attachmentData)
    },
    /**
     * 根据url获取option
     */
    getAsyncOptions() {
      console.log(this.item);
      const { optionsUrl, dicType, params } = this.item;
      let data = params;
      if (dicType) {
        data = Object.assign({ dicType: dicType }, data);
      }
      if (optionsUrl) {
        initData(optionsUrl, data)
          .then(res => {
            if (res.code === 200) {
              this.asyncOptions = res.data.content || res.data;
            }
          })
          .catch(err => {
            this.$message.error(err.message);
          });
      }
    },

    getAsyncCascadeOptions(params) {
      const { optionsUrl } = this.item;
      if (optionsUrl) {
        initData(optionsUrl, params)
          .then(res => {
            if (res.code === 200) {
              this.asyncOptions = res.data.content || res.data;
            }
          })
          .catch(err => {
            this.$message.error(err.message);
          });
      }
    },

    mapSelectOptions(props, options = []) {
      if (props) {
        const { label, value } = props;
        return options.map(item => {
          item.label = item[label];
          item.value = item[value];
          return item;
        });
      }
      return options;
    },

    /**
     * 表单值改变事件
     * @param val 改变的值
     * @param key 绑定对象的key
     */
    handleChangeEvent(val, key) {
      console.log('val', '------->item');
      this.$emit("input", val);
      this.$emit("changeSelect", val);
    },
    /**
     * 获取焦点事件
     * @param key 绑定对象的key
     */
    handleFocusEvent(key) {
      console.log(key, '----->item');
      this.$emit("handleFocusEvent", key);
    },
    isObjectEqual(obj1, obj2) {
      const o1 = obj1 instanceof Object;
      const o2 = obj2 instanceof Object;
      if (!o1 || !o2) {
        // 如果不是对象 直接判断数据是否相等
        return obj1 === obj2;
      }
      // 判断对象的可枚举属性组成的数组长度
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
      }
      for (const attr in obj1) {
        const a1 =
          Object.prototype.toString.call(obj1[attr]) === "[object Object]";
        const a2 =
          Object.prototype.toString.call(obj2[attr]) === "[object Object]";
        const arr1 =
          Object.prototype.toString.call(obj1[attr]) === "[object Array]";
        if (a1 && a2) {
          // 如果是对象继续判断
          return this.isObjectEqual(obj1[attr], obj2[attr]);
        } else if (arr1) {
          // 如果是对象 判断
          if (obj1[attr].toString() !== obj2[attr].toString()) {
            return false;
          }
        } else if (obj1[attr] !== obj2[attr]) {
          // 不是对象的就判断数值是否相等
          return false;
        }
      }
      return true;
    }
  }
};
</script>

<style scoped lang="scss">
/*详情时去掉边框线*/
.is-look {
  ::v-deep  .el-input__inner {
    color: #333;
    background: none;
    border: none;
    cursor: text !important;
  }
  ::v-deep  .el-textarea {
    .el-textarea__inner {
      color: #333;
      background: none;
      border: none;
      cursor: text !important;
    }
  }
  ::v-deep  .el-select__tags {
    .el-tag--info {
      color: #333;
      background: none;
      border: none;
      cursor: text !important;
      font-size: 13px;
    }
  }
  ::v-deep  .el-input__suffix {
    display: none;
  }
}

/* 改变附件上传按钮的样式 */
.upload-class ::v-deep   {

    .upload .el-button:hover {
        background-color: #1c9cff;
        color: #fff;
        transition: all .5s;
    }
}
</style>
