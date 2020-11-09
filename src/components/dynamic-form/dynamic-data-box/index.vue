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
      @click.native="disabled?'':open()"
      suffix-icon="el-icon-search"
    ></el-input>
    <el-button
      v-else
      :type="trigger.btnType"
      @click.native="open()"
    >{{trigger.title}}</el-button>
    <drag-dialog
      :show.sync="dataBoxVisible"
      :title="title"
      width="80%"
      height="500px"
      :enableDrag="true"
      append-to-body
    >
      <el-row>
        <el-col :span="18">
          <el-card class="box-card">
            <dynamic-search
              :data="tableFilterList(tableHead)"
              @search="dynamicSearch"
            />
            <edit-table
              :loading="loading"
              :head="tableHead"
              :data="data"
              :pageInfo="pageInfo"
              :rowKeyField="props.value"
              ref="dataBoxTable"
              :checkbox="multiple"
              :reserveSelection="true"
              :showNumber="true"
              :toolBar="false"
              @handleSelectionChange="handleSelectionChange"
              @handleCurrentChange="handleCurrentChange"
              @handlePageChange="pageChange"
              @handleSizeChange="sizeChange"
            ></edit-table>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="box-card">
            <div
              slot="header"
              class="clearfix selected-header"
            >
              <span class="selected-title">已选择 {{filteredData.length}} 项</span>
              <el-button
                type="primary"
                icon="el-icon-check"
                size="mini"
                @click="confirm"
              >确认</el-button>
            </div>
            <el-input
              placeholder="请输入内容"
              prefix-icon="el-icon-search"
              v-model="selectedSearchInp"
              clearable
            ></el-input>
            <el-scrollbar wrap-class="scrollbar-wrapper">
              <div
                class="selected-item"
                v-for="(item, index) in filteredData"
                :key="index"
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  :open-delay="400"
                  placement="top"
                >
                  <div
                    slot="content"
                    v-html="item[props.label]"
                  ></div>
                  <p
                    class="ellipsis"
                    v-html="item[props.label]"
                  ></p>
                </el-tooltip>
                <i
                  class="el-icon-circle-close"
                  @click="delSelection(item)"
                ></i>
              </div>
            </el-scrollbar>
          </el-card>
        </el-col>
      </el-row>
    </drag-dialog>
  </div>
</template>
<script>
import DragDialog from "@/components/drag-dialog";
import DynamicSearch from "@/components/dynamic-search";
import EditTable from "@/components/edit-table/index";
import dataTableMixin from "@/mixins/dataTableMixin";
import { setTimeout } from "timers";
import { log } from 'util';
export default {
  name: "dynamicDataBox",
  mixins: [dataTableMixin],
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
      default: "数据选择"
    },
    placeholder: {
      type: String,
      default: "请选择..."
    },
    multiple: {
      type: Boolean,
      default: true
    },
    props: {
      type: Object,
      default: () => {
        return { label: "label", value: "value", children: "children" };
      }
    },
    hostUrl: String, // 表格远程数据url
    method: {
      type: String,
      default: "get"
    },
    tableColumn: {
      type: Array, // 表头数据
      default: () => {
        return [];
      }
    },
    tableData: {
      type: Array, // 选项数据
      default: () => {
        return [];
      }
    },
    entityPath: String, // 表格远程数据实体路径，与 url 互斥
    extendParms: Object, // 扩展参数
    extendSearch: {
      type: Array,
      default: () => {
        return [];
      }
    },
    trigger: {
      type: Object,
      default: () => {
        return {
          type: "input"
        };
      }
    }
  },
  components: {
    DragDialog,
    DynamicSearch,
    EditTable
  },
  data() {
    return {
      box: false,
      labelText: this.multiple ? [] : "",
      selectedSearchInp: "",
      dataBoxVisible: false,
      tableHead: [],
      checkedValue: null
    };
  },
  watch: {
    value(val) {
      this.initData();
      this.checkedValue = val;
    },
    dataBoxVisible(val) {
      if (!val) {
        this.checkedValue = null;
        this.$emit("diologClode");
      } else {
        if (this.hostUrl) {
          this.$nextTick(() => {
            this.init();
          });
        } else {
          this.loading = false
          this.data = this.tableData;
        }
      }
    },
    tableHead(val) {
      val.forEach(item => {
        this.extendSearch.forEach(searchItem => {
          if (item.property === searchItem.property) {
            item.query = searchItem.query;
          }
        });
      });
    },
    hostUrl() {
      if (this.hostUrl || this.entityPath) {
        this.$nextTick(() => {
          this.init();
        });
      } else {
        this.loading = false
        this.data = this.tableData;
        this.tableHead = this.tableColumn;
      }
    }
  },
  computed: {
    labelShow() {
      return this.multiple
        ? this.labelText.join("/").toString()
        : this.labelText;
    },
    selectedCount() {
      return !this.value
        ? 0
        : this.multiple
        ? this.value.length
        : this.value && this.value[this.props.label]
        ? 1
        : 0;
    },
    filteredData() {
      return this.queryArr(this.checkedValue || [], this.selectedSearchInp);
    }
  },
  created() {
    if (this.hostUrl || this.entityPath) {
      this.$nextTick(() => {
        this.init();
      });
    } else {
      this.tableHead = this.tableColumn;
      this.data = this.tableData;
    }
  },
  mounted() {
    // 初始化数据
    this.initData();
  },
  methods: {
    initData() {
      this.text = this.value;
      const labelKey = this.props.label;
      this.multiple ? (this.labelText = []) : (this.labelText = "");
      if (!this.text) return;

      if (this.multiple) {
        this.text.forEach(ele => {
          this.labelText.push(ele[labelKey]);
        });
      } else {
        this.labelText = this.text[labelKey];
      }
    },
    initRowCheckedData() {
      if (this.multiple) {
        this.value.forEach(ele => {
          const row = this.data.find(
            item => item[this.props.value] === ele[this.props.value]
          );
          this.toggleSelection(row || ele);
        });
      } else {
        const row = this.data.find(
          item => this.value && item[this.props.value] === this.value[this.props.value]
        );
        this.setCurrent(row || this.value);
      }
    },
    beforeInit() {
      const _extendParms = this.extendParms;
      if (this.hostUrl) {
        this.url = this.hostUrl;
        this.tableHead = this.tableColumn;
        this._method = this.method;
      } else {
        _extendParms["entityPath"] = this.entityPath;
      }
      const query = this.query;
      const params = { page: this.page, size: this.size };
      this.params = Object.assign(params, query, _extendParms);
      return true;
    },
    open() {
      this.dataBoxVisible = true;
      // setTimeout(() => this.initRowCheckedData(), 200);
      if (this.hostUrl) {
        setTimeout(() => this.initRowCheckedData(), 200);
      } else {
        this.loading = false
        this.tableHead = this.tableColumn;
        this.data = this.tableData
      }
    },
    /**
     * 删除已勾选数据
     */
    delSelection(item) {
      this.multiple ? this.toggleSelection(item, false) : this.setCurrent();
    },
    /**
     * 处理多项被选中，row 为空时清空所有被选中
     */
    toggleSelection(row, checked = true) {
      this.$refs.dataBoxTable.$refs.dragTable.toggleRowSelection(row, checked);
    },
    /**
     * 多选后事件回调
     */
    handleSelectionChange(items) {
      this.$emit("change", items);
      this.checkedValue = items;
    },
    /**
     * 处理单选被选中
     */
    setCurrent(row, checked = true) {
      this.$refs.dataBoxTable.$refs.dragTable.setCurrentRow(row, checked);
    },
    /**
     * 处理单选后事件回调
     */
    handleCurrentChange(val) {
      if (!this.multiple) {
        this.$emit("change", val);
        this.checkedValue = val;
      }
    },
    /**
     * 完成确认
     */
    confirm() {
      console.log('sss',this.checkedValue)
      this.dataBoxVisible = false;
      this.$emit("confirm", this.checkedValue);
      this.$emit("input", this.checkedValue);
      if (this.multiple) {
        this.$refs.dataBoxTable.$refs.dragTable.clearSelection();
      } else {
        this.setCurrent(this.checkedValue, false);
      }
      this.$nextTick(() => {
        this.checkedValue = null;
      });
    },

    dataChange(val) {
      const { value } = this.props;
      this.$emit(
        "dataChange",
        this.optionsData.find(i => i[value] === val)
      );
    },
    /**
     * 查询已选择数据
     */
    queryArr(val, q) {
      return this.multiple
        ? val.filter(v =>
            Object.values(v).some(v => new RegExp(q + "").test(v))
          )
        : val && val[this.props.label]
        ? [val]
        : [];
    }
  }
};
</script>
<style lang="scss" scoped>
.data-box-container {
  ::v-deep  .popup-box {
    ::v-deep  .slot-box {
      ::v-deep  .el-input__inner,
      ::v-deep  .textarea__inner,
      ::v-deep  .el-input__inner:focus,
      ::v-deep  .textarea__inner:focus {
        border-color: #dcdfe6;
      }
    }
  }
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis; //文本溢出显示省略号
  white-space: nowrap; //文本不会换行
}
::v-deep  .box-card {
  margin-left: 10px;
  ::v-deep  .el-card__body {
    min-height: 200px;
  }
}
.selected-header {
  overflow: hidden;
  .selected-title {
    line-height: 28px;
  }
  .el-button {
    float: right;
  }
}
::v-deep  .scrollbar-wrapper {
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
</style>
