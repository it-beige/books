<template>
  <el-select
    ref="select"
    popper-class="mod-select-tree"
    :value="labelModel"
    value-key="value"
    :disabled="disabledSelected"
    :filter-method="filterMethod"
    :filterable="filterable"
    :clearable="clearable"
    :multiple="multiple"
    v-bind="$attrs"
    :popper-append-to-body="false"
    @clear="clearHandler"
    @remove-tag="removeTag"
    @visible-change="visibleChange"
    v-on="$listeners"
  >
    <el-option :value="valueModel">
      <!--:label="labelModel"-->
      <el-tree
        ref="tree"
        empty-text="无数据"
        :expand-on-click-node="false"
        :show-checkbox="multiple"
        :accordion="accordion"
        :data="mapOptions"
        :props="props"
        :node-key="props.value"
        :check-strictly="true"
        :filter-node-method="filterNode"
        :render-content="renderContent"
        :lazy="lazy"
        :load="loadNode"
        @node-click="onNodeClick"
        @check="onNodeCheck"
      />
    </el-option>
  </el-select>
</template>

<script>
/* eslint-disable */

export default {
  name: 'TreeSelect',
  // 设置绑定参数
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 接收绑定参数
    value: [String, Number, Array],
    // 是否可以清空选项
    clearable: Boolean,
    // 是否可以过滤
    filterable: Boolean,
    // 是否可多选
    multiple: Boolean,
    // 根节点key值
    rootKey: String,
    // 禁用
    disabled: Boolean,
    // 树形控件 - 是否每次只打开一个同级树节点展开
    accordion: Boolean,
    // 树形控件 - 选项数据，懒加载时无需设置
    options: {
      type: Array,
      default: () => []
    },
    lazy: {
      type: Boolean, // 是否懒加载子节点，需与 load 方法结合使用
      default: false
    },
    // 树形控件 - 配置项
    props: {
      type: Object,
      default: () => ({
        value: 'value', // ID字段名
        label: 'label', // 显示名称
        children: 'children'
      })
    },
    // 查询参数
    queryParams: {
      type: Object,
      default: () => ({
        rows: 100000,
        page: 1,
        sort: 'orderNum-'
      })
    },
    // 禁止选的值
    disabledValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      labelModel: this.multiple ? [] : '', // 输入框显示值
      valueModel: this.multiple ? [] : '', // 实际请求传值
      labelModel2: [],
      modelItem: {}
    }
  },
  computed: {
    disabledSelected() {
      if (this.disabled) return true
      return this.$parent.form ? this.$parent.form.disabled : false
    },
    mapOptions() {
      if (this.disabledValue.length) {
        return this.disabledNodeAndChildren(this.options)
      }
      return this.options
    }
  },
  watch: {
    valueModel: {
      handler(val) {
        this.$emit('change', val)
        this.$nextTick(() => {
          if (val instanceof Array && this.multiple) {
            this.$refs.tree.setCheckedKeys(val)
            this.$refs.tree.setCurrentKey(null)
          } else if (!this.multiple) {
            if (val) {
              this.$refs.tree.setCurrentKey(val)
            }
          }
        })
      },
      deep: true
    },
    value: {
      handler(val) {
        if (val) {
          this.initHandler()
        } else {
          this.labelModel = this.multiple ? [] : ''
          this.labelModel2 = []
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 初始化值
    initHandler() {
      if (!this.value) return
      const val = this.value
      let valueModel = null
      this.$nextTick(() => {
        if (val instanceof Array && this.multiple) {
          valueModel = val
          val.forEach(i => {
            const temp = this.$refs.tree.getNode(i)
            if (temp) {
              this.labelModel.push(temp.label)
            }
          })
          // 设置默认勾选
          this.$refs.tree.setCheckedKeys(val)
        } else {
          const temp = this.$refs.tree.getNode(val)
          if (temp && this.multiple) {
            if (!this.valueModel.includes(val)) {
              this.labelModel.push(temp.label)
              valueModel.push(val)
            }
            this.$refs.tree.setChecked(val, true, true)
            this.$refs.tree.setCurrentKey(null)
          } else if (!this.multiple) {
            this.labelModel = temp ? temp.label : ''
            valueModel = val
            // 设置默认选中
            this.$refs.tree.setCurrentKey(val)
          }
        }
        this.valueModel = valueModel
        if (this.multiple) {
          this.labelModel = Array.from(new Set(this.labelModel))
          this.labelModel2 = this.labelModel
        }
      })
    },
    // 切换选项
    onNodeClick(data, node) {
      this.modelItem = data
      if (node.disabled && !this.multiple) {
        this.$refs.tree.setCurrentKey(this.value || null)
      } else if (!node.disabled) {
        if (this.multiple) {
          const index = this.valueModel.indexOf(node.key)
          if (index !== -1) {
            this.labelModel.splice(index, 1)
            this.valueModel.splice(index, 1)
          } else {
            this.labelModel.push(node.label)
            this.valueModel.push(node.key)
          }
          this.labelModel2 = this.labelModel
        } else {
          this.labelModel = node.label
          this.valueModel = node.key
          this.$refs.select.blur() // 收起下拉框
          // this.$refs.select.focus()  // 获取焦点
        }
        this.emitChange()
      }
    },
    // 选择框勾选
    onNodeCheck(data, checked) {
      if (this.multiple) {
        this.valueModel = checked.checkedKeys
        this.labelModel = checked.checkedNodes.map(i => i.label)
        this.labelModel2 = this.labelModel
      }
      this.emitChange()
    },
    // 下拉菜单显示回调
    async visibleChange(show) {
      if (!show) return
      // 确保滚动条位置正确显示
      if (show && !this.labelModel) {
        this.$nextTick(() => {
          this.labelModel = ''
          this.$nextTick(() => {
            const dom = document.querySelector('.el-select-dropdown__wrap')
            dom.scrollTop = 0
          })
        })
      }
      this.$emit('refresh')
    },
    // 选择器检索过滤方法
    filterMethod(query) {
      // 调用树形控件的过滤
      this.$refs.tree.filter(query)
      // 忽略选择器本身的过滤
      return true
    },
    // 树节点过滤方法
    filterNode(query, data) {
      if (!query) return true
      return data[this.props.label].includes(query)
    },
    // 清空已选
    clearHandler() {
      this.valueModel = this.multiple ? [] : ''
      this.labelModel = this.multiple ? [] : ''
      this.labelModel2 = []
      this.$refs.tree.filter()
    },
    removeTag(val) {
      const index = this.labelModel2.indexOf(val)
      if (index !== -1) {
        this.valueModel.splice(index, 1)
        this.labelModel2.splice(index, 1)
      }
    },
    // 节点渲染函数
    renderContent(h, { node, data }) {
      return (
        <span
          class={`${!this.multiple ? 'el-tree-node__label' : ''} ${
            data.disabled ? 'is-node-disabled' : ''
          }`}
        >
          {node.label}
        </span>
      )
    },
    emitChange() {
      this.$emit('input', this.valueModel)
      this.$emit('modelItem', this.modelItem)
    },
    loadNode(node, resolve) {
      this.$emit('loadNode', { node, resolve }) //
    },
    // 禁用数据
    disabledNodeAndChildren(data = [], isDisabled = false) {
      return data.map(i => {
        if (isDisabled || this.disabledValue.includes(i[this.props.value])) {
          if (!i.disabled) {
            i.disabled = 1
          }
          const children = i[this.props.children || 'children']
          if (children && children.length) {
            i.children = this.disabledNodeAndChildren(children, true)
          }
        } else if (i.disabled === 1) {
          i.disabled = 0
          const children = i[this.props.children || 'children']
          if (children && children.length) {
            i.children = this.disabledNodeAndChildren(children)
          }
        } else {
          const children = i[this.props.children || 'children']
          if (children && children.length) {
            i.children = this.disabledNodeAndChildren(children)
          }
        }
        return i
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/styles/element-variables.scss";
.el-select-dropdown {
  max-height: 274px;
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  padding: 0;
}

.el-select-dropdown__item.selected {
  font-weight: normal;
}

ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}

.el-tree-node__label {
  font-weight: normal;
}

.el-tree >>> .is-current .el-tree-node__label {
  color: $--color-primary;
  font-weight: 700;
}

.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}

.el-tree >>> .el-tree-node__content .is-node-disabled {
  cursor: not-allowed;
  color: #c0c4cc;
  width: 100%;
}
.el-tree >>> .el-tree-node__children .el-tree-node__content .is-node-disabled {
  color: #c0c4cc;
}
</style>
