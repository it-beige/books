<template>
  <el-form-item
    :ref="item.key"
    :class="{'is-look': disabled}"
    :label="item.label"
    :prop="item.key"
    :rules="item.rules"
  >
    <span v-if="item.icon" class="svg-container">
      <svg-icon :icon-class="item.icon" />
    </span>
    <el-input
      v-if="['input','text','password','email','textarea','number'].includes(item.type)"
      v-bind="$attrs"
      :type="item.subtype || item.type"
      resize="none"
      :autosize="item.autoSize || { minRows: 4, maxRows: 6}"
      :placeholder="!isDisabled?item.placeholder:''"
      :disabled="isDisabled"
      :maxlength="item.maxlength"
      :show-word-limit="item.maxlength && true"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
      @change="controlDataChange($event, item.key)"
    />
    <el-upload
      v-else-if="item.type==='upload'"
      class="upload-demo"
      :action="item.uploadUrl"
      :disabled="isDisabled"
      :on-success="handleSuccessUpload"
      :headers="uploadHeaders"
      multiple
    >
      <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>
    <el-radio-group
      v-else-if="item.type==='radio'"
      v-bind="$attrs"
      :placeholder="!isDisabled?item.placeholder:''"
      :disabled="isDisabled"
      v-on="$listeners"
    >
      <component
        :is="item.button?'el-radio-button':'el-radio'"
        v-for="o in item.options||asyncOptions"
        :key="o.value"
        :label="o.value"
        :disabled="o.disabled"
        :border="item.border"
      >{{ o.label }}</component>
    </el-radio-group>
    <el-checkbox-group v-else-if="item.type==='checkbox'" v-bind="$attrs" v-on="$listeners">
      <component
        :is="item.button?'el-checkbox-button':'el-checkbox'"
        v-for="o in mapSelectOptions(item.props, item.options||asyncOptions)"
        :key="o.value"
        :disabled="o.disabled"
        :label="o.value"
        :border="item.border"
      >{{ o.label }}</component>
    </el-checkbox-group>
    <el-select
      v-else-if="item.type==='select'"
      v-bind="$attrs"
      :loading="loading"
      :size="item.size"
      :multiple="item.multiple"
      :readonly="item.readonly"
      :collapse-tags="item.tags"
      :clearable="item.clearable?false:item.clearable"
      :placeholder="!isDisabled?item.placeholder:''"
      :multiple-limit="item.limit"
      :disabled="isDisabled"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
      @change="controlDataChange($event, item.key)"
    >
      <el-option
        v-for="o in mapSelectOptions(item.props, item.options||asyncOptions)"
        :key="o.value"
        :label="o.label"
        :value="o.value"
        :disabled="o.disabled"
      />
    </el-select>
    <tree-select
      v-else-if="item.type === 'treeSelect'"
      ref="treeSelect"
      v-bind="$attrs"
      :loading="loading"
      :placeholder="!isDisabled?item.placeholder:''"
      :disabled="isDisabled"
      :multiple="item.multiple"
      :options="item.options || asyncOptions"
      :filterable="item.filterable"
      :clearable="item.clearable"
      :props="item.props"
      :lazy="item.lazy"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
      @loadNode="item.load($event, item.key)"
      @modelItem="modelItem"
    />
    <el-switch v-else-if="item.type==='switch'" v-bind="$attrs" v-on="$listeners" />
    <el-time-picker
      v-else-if="item.type==='time'"
      :is-range="item.subtype==='timerange' ? true : false"
      :format="item.valueFormat"
      :value-format="item.valueFormat"
      v-bind="$attrs"
      range-separator="至"
      :start-placeholder="item.startPlaceholder"
      :end-placeholder="item.endPlaceholder"
      :readonly="item.readonly"
      :clearable="item.clearable?false:item.clearable"
      :placeholder="!isDisabled?item.placeholder:''"
      :disabled="isDisabled"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
    />
    <el-date-picker
      v-else-if="item.type==='date'"
      :type="item.subtype"
      :format="item.viewFormat||item.valueFormat"
      v-bind="$attrs"
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      :disabled="isDisabled"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
    />
    <form-upload
      v-else-if="item.type === 'file'"
      v-bind="$attrs"
      :disabled="isDisabled"
      v-on="$listeners"
    />
    <dynamic-data-box
      v-else-if="item.type === 'databox'"
      v-bind="$attrs"
      :value-fileld="item.valueFileld"
      :label-fileld="item.labelFileld"
      :host-url="item.url"
      :table-column="item.tableColumn"
      :entity-path="item.entityPath"
      :extend-params="item.extendParams"
      :extend-search="item.extendSearch"
      :multiple="item.multiple"
      :disabled="isDisabled"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
      @confirm="val => { getContent(val) }"
    />
    <IconSelect
      v-else-if="item.type === 'iconSelect'"
      v-bind="$attrs"
      :disabled="isDisabled"
      v-on="$listeners"
      @focus="handleFocusEvent(item.key)"
    />
    <el-calendar v-else-if="item.type === 'calendar'" v-bind="$attrs" v-on="$listeners" />
    <form-slot-content v-else-if="item.type === 'slot' && formThis.$scopedSlots[item.key]" :value="$attrs.value" />
    <span v-else>未知控件类型{{ item.type }}</span>
  </el-form-item>
</template>
<script>
import { initData } from '@/api/data'
import TreeSelect from '@/components/common/TreeSelect/index.vue'
import FormUpload from '@/components/common/FormUpload'
import { getToken } from '@/utils/auth'
import IconSelect from '@/components/common/IconSelect/index.vue'
import ImgUpload from '@/components/common/ImgUpload'

export default {
  name: 'DynamicFormItem',
  components: {
    TreeSelect,
    FormUpload,
    ImgUpload,
    IconSelect,
    'form-slot-content': {
      props: {
        value: {
          type: [Number, String, Boolean, Array, Date, Object]
        }
      },
      inject: {
        formThis: { default: {}}
      },
      render() {
        const { prop } = this.$parent
        return this.formThis.$scopedSlots[prop](this.value)
      }
    }
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    disabled: Boolean
  },
  inject: {
    formThis: { default: {}}
  },
  data() {
    return {
      asyncOptions: [],
      uploadHeaders: {},
      loading: false,
      fileImageList: []
    }
  },
  computed: {
    isRange() {
      return this.subtype === 'timerange'
    },
    isDisabled() {
      return this.item.disabled || this.disabled
    }
  },
  watch: {
    'item.params': {
      handler(val, oldVal) {
        if (val === undefined && oldVal === undefined) {
          return
        }
        if (!this.isObjectEqual(val, oldVal)) {
          if (!Object.prototype.hasOwnProperty.call(this.item, 'cascade')) {
            this.getAsyncCascadeOptions(val)
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    if (!Object.prototype.hasOwnProperty.call(this.item, 'cascade')) this.getAsyncOptions()
    this.uploadHeaders = { Authorization: `Bearer ${getToken()}` }
  },
  methods: {
    getContent(val) {
      if (this.item.key === 'projectId') {
        this.$emit('getProjectId', val.id)
      } else if (this.item.key === 'projectNode') {
        this.$emit('getProjectNode', val.id)
      } else if (this.item.key === 'org') {
        this.$emit('getContent', { key: this.item.key, value: val.id })
      } else {
        this.$emit('getContent', { key: this.item.key, value: val })
      }
    },
    handleSuccessUpload(response) {
      this.$emit('getFileId', response.data)
    },
    /* handleSuccessUploadImg({ file, fileList }, splicing) {
      this.fileImageList.push(process.env.VUE_APP_PROXY_SERVER + '/' + splicing + `?fileId=${file.response.data}`)
    }, */
    /**
     * 根据url获取option
     */
    getAsyncOptions() {
      const { optionsUrl, dicType, params, dataField } = this.item
      let data = params
      if (dicType) {
        data = Object.assign({ code: dicType }, data)
      }
      if (optionsUrl) {
        this.loading = true
        initData(optionsUrl, data)
          .then(res => {
            if (res.code === 200) {
              this.asyncOptions = res.data.content || res.data
              if (dataField) {
                this.asyncOptions = this.asyncOptions[dataField]
              }
              this.$emit('asyncOptions', this.asyncOptions)
            }
          })
          .catch(err => {
            this.$message.error(err.message)
          }).finally(() => {
            this.loading = false
          })
      }
    },

    getAsyncCascadeOptions(params) {
      const { optionsUrl } = this.item
      if (optionsUrl) {
        this.loading = true
        initData(optionsUrl, params)
          .then(res => {
            if (res.code === 200) {
              this.asyncOptions = res.data.content || res.data
            }
          })
          .catch(err => {
            this.$message.error(err.message)
          }).finally(() => {
            this.loading = false
          })
      }
    },

    mapSelectOptions(props, options = []) {
      if (props) {
        const { label, value } = props
        return options.map(item => {
          item.label = item[label]
          item.value = item[value]
          return item
        })
      }
      return options
    },

    /**
     * 获取焦点事件
     * @param key 绑定对象的key
     */
    handleFocusEvent(key) {
      this.$emit('handleFocusEvent', key)
    },
    controlDataChange(val, key) {
      const obj = { 'key': key, 'value': val }
      this.$emit('controlDataChange', obj)
    },
    modelItem(val) {
      this.$emit('modelItem', val)
    },
    isObjectEqual(obj1, obj2) {
      const o1 = obj1 instanceof Object
      const o2 = obj2 instanceof Object
      if (!o1 || !o2) {
        // 如果不是对象 直接判断数据是否相等
        return obj1 === obj2
      }
      // 判断对象的可枚举属性组成的数组长度
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false
      }
      for (const attr in obj1) {
        const a1 =
          Object.prototype.toString.call(obj1[attr]) === '[object Object]'
        const a2 =
          Object.prototype.toString.call(obj2[attr]) === '[object Object]'
        const arr1 =
          Object.prototype.toString.call(obj1[attr]) === '[object Array]'
        if (a1 && a2) {
          // 如果是对象继续判断
          return this.isObjectEqual(obj1[attr], obj2[attr])
        } else if (arr1) {
          // 如果是对象 判断
          if (obj1[attr].toString() !== obj2[attr].toString()) {
            return false
          }
        } else if (obj1[attr] !== obj2[attr]) {
          // 不是对象的就判断数值是否相等
          return false
        }
      }
      return true
    }
  }
}
</script>

<style scoped lang="scss">
/*详情时去掉边框线*/
.is-look {
  ::v-deep .el-input__inner {
    color: #333;
    background: none;
    border: none;
    cursor: text !important;
  }

  ::v-deep .el-textarea {
    .el-textarea__inner {
      color: #333;
      background: none;
      border: none;
      cursor: text !important;
    }
  }

  ::v-deep .el-select__tags {
    .el-tag--info {
      color: #333;
      background: none;
      border: none;
      cursor: text !important;
      font-size: 13px;
    }
  }

  ::v-deep .el-input__suffix {
    display: none;
  }
}
</style>
