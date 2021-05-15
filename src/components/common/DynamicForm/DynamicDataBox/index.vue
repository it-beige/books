<template>
  <div class="data-box-container">
    <el-input
      v-if="trigger.type === 'input'"
      v-model="labelShow"
      :readonly="readonly"
      :autosize="{ minRows: minRows, maxRows: maxRows}"
      :disabled="disabled"
      :clearable="disabled?false:clearable"
      :placeholder="disabled?'':placeholder?placeholder:'请选择'"
      suffix-icon="el-icon-search"
      @click.native="disabled?'':open()"
    />
    <el-button v-else :type="trigger.btnType" :size="trigger.btnSize" @click.native="open()">{{ trigger.title }}</el-button>
    <DragDialog
      :show.sync="dataBoxVisible"
      :title="title"
      width="80%"
      height="500px"
      :enable-drag="true"
      append-to-body
    >
      <el-row>
        <el-col :span="18">
          <el-card class="box-card">
            <DynamicSearch :data="tableFilterList(tableHead)" @search="dataTableSearch" />
            <EditDataTable
              ref="dataBoxTable"
              :head="tableHead"
              :data.sync="list"
              height="380px"
              :total="total"
              :page="page"
              :loading="loading"
              :offset="offset"
              :border="true"
              :select-limit="selectLimit"
              :show-selection="multiple"
              :highlight-current-row="!multiple"
              :row-key-field="props.value"
              :reserve-selection="true"
              :show-number="true"
              :tool-bar="{hidden: true}"
              :row-class-name="tableRowClassName"
              @handleSelectionChange="handleSelectionChange"
              @current-change="handleCurrentChange"
              @handlePageChange="dataTablePageChange"
              @handleSizeChange="dataTableSizeChange"
            >
              <template #indexHeader>
                序号
              </template>
            </EditDataTable>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card right-box">
            <div slot="header" class="clearfix selected-header">
              <span class="selected-title">已选择 {{ filteredData.length }} 项</span>
              <el-button type="primary" icon="el-icon-check" size="mini" @click="confirm">确认</el-button>
            </div>
            <el-input
              v-model="selectedSearchInp"
              placeholder="请输入内容"
              prefix-icon="el-icon-search"
              clearable
            />
            <el-scrollbar wrap-class="scrollbar-wrapper">
              <div v-for="(item, index) in filteredData" :key="index" class="selected-item">
                <el-tooltip class="item" effect="dark" :open-delay="400" placement="top">
                  <div slot="content" v-html="item[props.label]" />
                  <p class="ellipsis" v-html="item[props.label]" />
                </el-tooltip>
                <i class="el-icon-circle-close" @click="delSelection(item)" />
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
      </el-row>
    </DragDialog>
  </div>
</template>
<script>
import DragDialog from '@/components/DragDialog'
import DynamicSearch from '@/components/common/DynamicSearch'
import DataTableMixin from '@/mixins/DataTableMixin'
/* eslint-disable */
export default {
  name: 'DynamicDataBox',
  components: {
    DragDialog,
    DynamicSearch,
    EditDataTable: () => import('@/components/common/EditDataTable')
  },
  mixins: [DataTableMixin],
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: true
    },
    minRows: {
      type: Number,
      default: 3
    },
    maxRows: {
      type: Number,
      default: 4
    },
    value: {
      type: [Array, Object, String, Number]
    },
    title: {
      type: String,
      default: '数据选择'
    },
    placeholder: {
      type: String,
      default: '请选择...'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    selectLimit: Number,
    props: {
      type: Object,
      default: () => {
        return { label: 'label', value: 'value', children: 'children' }
      }
    },
    hostUrl: String, // 表格远程数据url
    method: {
      type: String,
      default: 'get'
    },
    tableColumn: {
      type: Array, // 表头数据
      default: () => {
        return []
      }
    },
    tableData: {
      type: Array, // 选项数据
      default: () => {
        return []
      }
    },
    tableConfig: { // 表格配置
      type: Object,
      default: () => {}
    },
    entityPath: String, // 表格远程数据实体路径，与 url 互斥
    extendParams: Object, // 扩展参数
    extendSearch: {
      type: Array,
      default: () => {
        return []
      }
    },
    trigger: {
      type: Object,
      default: () => {
        return {
          type: 'input'
        }
      }
    },
    // 禁止选的值
    disabledValue: {
      type: Array,
      default: () => []
    },
    beforeConfirm: {
      type: Function,
      default: () => true
    }
  },
  data() {
    return {
      box: false,
      labelText: this.multiple ? [] : '',
      selectedSearchInp: '',
      dataBoxVisible: false,
      tableHead: [],
      checkedValue: null
    }
  },
  computed: {
    labelShow() {
      return this.multiple ? this.labelText.join('/').toString() : this.labelText
    },
    selectedCount() {
      return !this.value ? 0 : this.multiple ? this.value.length : this.value && this.value[this.props.label] ? 1 : 0
    },
    filteredData() {
      return this.queryArr(this.checkedValue || [], this.selectedSearchInp)
    }
  },
  watch: {
    value(val) {
      this.initData()
      this.checkedValue = val
    },
    dataBoxVisible(val) {
      if (!val) {
        this.checkedValue = null
        this.$emit('diologClode')
      } else {
        this.$nextTick(() => {
          this.dataTableInit().then(() => {
            this.initRowCheckedData()
          })
        })
      }
    },
    tableHead(val) {
      val.forEach(item => {
        this.extendSearch.forEach(searchItem => {
          if (item.property === searchItem.property) {
            item.query = searchItem.query
          }
        })
      })
    },
    hostUrl() {
      if (this.hostUrl || this.entityPath) {
        this.$nextTick(() => {
          this.dataTableInit()
        })
      } else {
        this.list = this.tableData
      }
    }
  },
  created() {
    if (!this.hostUrl && !this.entityPath) {
      this.list = this.tableData
    }
  },
  mounted() {
    // 初始化数据
    this.initData()
  },
  methods: {
    initData() {
      this.text = this.value
      const labelKey = this.props.label
      this.multiple ? (this.labelText = []) : (this.labelText = '')
      if (!this.text) return

      if (this.multiple) {
        this.text.forEach(ele => {
          this.labelText.push(ele[labelKey])
        })
      } else {
        this.labelText = this.text[labelKey]
      }
    },
    initRowCheckedData() {
      if (this.multiple) {
        if (this.value && this.value instanceof Array) {
          this.value.forEach(ele => {
            const row = this.list.find(
              item => item[this.props.value] === ele[this.props.value]
            )
            this.toggleSelection(row || ele)
          })
        }
      } else {
        const row = this.list.find(
          item =>
            this.value &&
            item[this.props.value] === this.value[this.props.value]
        )
        this.setCurrent(row || this.value)
      }
    },
    dataTableBeforeInit() {
      const _extendParams = this.extendParams
      if (this.hostUrl) {
        this._url = this.hostUrl
        this.tableHead = this.tableColumn
        this._method = this.method
      } else {
        _extendParams['entityPath'] = this.entityPath
      }
      const params = { pageIndex: this.page, pageSize: this.offset }
      this._params = Object.assign(params, _extendParams, this._query)
      return true
    },
    open() {
      this.dataBoxVisible = true
      // setTimeout(() => this.initRowCheckedData(), 200)
    },
    /**
     * 删除已勾选数据
     */
    delSelection(item) {
      this.multiple ? this.toggleSelection(item, false) : this.setCurrent()
    },
    /**
     * 处理多项被选中，row 为空时清空所有被选中
     */
    toggleSelection(row, checked = true) {
      this.$refs.dataBoxTable.$refs.elTable.toggleRowSelection(row, checked)
    },
    /**
     * 多选后事件回调
     */
    handleSelectionChange(items) {
      this.$emit('change', items)
      this.checkedValue = items
    },
    /**
     * 处理单选被选中
     */
    setCurrent(row, checked = true) {
      this.$refs.dataBoxTable.$refs.elTable.setCurrentRow(row, checked)
    },
    /**
     * 处理单选后事件回调
     */
    handleCurrentChange(val) {
      if (!this.multiple) {
        this.$emit('change', val)
        this.checkedValue = val
      }
    },
    /**
     * 完成确认
     */
    confirm() {
      if (this.beforeConfirm(this.checkedValue)) {
        // this.labelText = this.checkedValue[this.props.label]
        this.dataBoxVisible = false
        this.$emit('confirm', this.checkedValue)
        this.$emit('input', this.checkedValue)
        if (this.multiple) {
          this.$refs.dataBoxTable.$refs.elTable.clearSelection()
        } else {
          this.setCurrent(this.checkedValue, false)
        }
        this.$nextTick(() => { this.checkedValue = null })
      }
    },
    /**
     * 查询已选择数据
     */
    queryArr(val, q) {
      return this.multiple ? val.filter(v => Object.values(v).some(v => new RegExp(q + '').test(v))) : val && val[this.props.label] ? [val] : []
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
    },

    tableRowClassName({ row }) {
      if (this.disabledValue.length) {
        const rowKeys = this.disabledValue.map(i => i[this.props.value])
        if (rowKeys.includes(row[this.props.value])) {
          if (this.multiple) {
            this.toggleSelection(row, false)
          }
          return 'disabled-row'
        }
      }
      return ''
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-table .disabled-row {

  color: #999;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(23px);
    transform-origin: 0 0;
    pointer-events: none;
    box-sizing: border-box;
    border: 1px solid #ccc;
  }
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis; //文本溢出显示省略号
  white-space: nowrap; //文本不会换行
}
::v-deep .box-card {
  margin-left: 10px;
  ::v-deep .el-card__body {
    min-height: 476px;
  }
}
  .right-box {
    .selected-header {
      overflow: hidden;
      .selected-title {
        line-height: 28px;
      }
      .el-button {
        float: right;
      }
    }
    ::v-deep .scrollbar-wrapper {
      padding: 15px 0;
      .selected-item {
        padding-left: 5px;
        line-height: 38px;
        border-bottom: 1px solid #dfe6ec;
        position: relative;
        cursor: pointer;
        p {
          margin: 0;
          padding: 0;
          padding-right: 10px;
          width: 88%;
        }
        .el-icon-circle-close {
          font-size: 18px;
          position: absolute;
          right: 0;
          bottom: 0;
          padding: 10px;
          display: none;
          color: #b4bccc;
        }
        &:hover .el-icon-circle-close {
          display: block;
        }
      }
    }
  }
</style>
