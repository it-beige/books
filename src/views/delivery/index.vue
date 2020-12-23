<template>
  <div class="app-container delivery">
    <el-card slot="left" shadow="never">
      <div slot="header" class="header-container">
        <div class="project-wrapper">
          <span>项目名称</span>
          <dynamic-data-box
            v-model="dynamicDataBoxDataObj"
            :host-url="dynamicDataBoxData.url"
            :table-column="dynamicDataBoxData.tableColumn"
            :extend-parms="dynamicDataBoxData.extendParms"
            :props="dynamicDataBoxData.props"
            :multiple="false"
            @confirm="val => { getContent(val) }"
          />
        </div>
        <div class="new-button">
          <el-button type="primary" @click="add">新增</el-button>
          <el-button type="danger" @click="remove">删除</el-button>
        </div>
      </div>

      <!-- 筛选表单区域 -->
      <div class="filter-wrapper">
        <!-- 搜索-->
        <dynamic-search :search-span="18" :data="tableFilterList(tableHead)" @search="dataTableSearch" />
      </div>
      <!-- 动态表格区域 -->
      <edit-data-table
        ref="editTableRef"
        :head="tableHead"
        :data.sync="list"
        :total="total"
        :offset="offset"
        :page="page"
        :loading="loading"
        :show-number="true"
        :show-selection="true"
        stripe
        border
        :tool-bar="{hidden: true}"
        :cell-style="cellStyleCallBack"
        @cell-click="clickCellHnalde"
        @selection-change="selectionChangeHandle"
      >
        <!-- 自定义序号 -->
        <template #indexHeader>
          序号
        </template>
      </edit-data-table>
    </el-card>
  </div>
</template>

<script>
import '@/components/EditDataTable'
import DynamicSearch from '@/components/DynamicSearch'
import DataTableMixin from '@/mixins/DataTableMixin'
import configMixin from './config/indexConfig'
import {
  requestUrl
} from '@/api/constant'
import {
  delIntermediaryList
} from '@/api/tenancy/customer-relationship/intermediaryAPI'

export default {
  components: {
    DynamicSearch
  },
  mixins: [DataTableMixin, configMixin],
  data() {
    return {
      selecionList: [], // 勾选的数据
      dynamicDataBoxDataObj: {},
      list: [
        {
          projectName: '创邑SPACE|海上海',
          number: 'TFYS20200001',
          name: 'HTO120200001',
          grade: '101',
          leader: '张三',
          createTime3: '王一',
          createTime2: '2020.11.13',
          createTime4: '待审批'
        }
      ],

    }
  },
  computed: {},
  watch: {},
  created() {
    // this.dataTableInit()
  },
  methods: {
    // 获取列表数据
    dataTableBeforeInit() {
      this._url = requestUrl.getIntermediaryList
      const params = {
        pageIndex: this.page,
        pageSize: this.offset
      }
      this._params = Object.assign(params, this._query)
      return true
    },

    // 设置项目名称单元格样式
    cellStyleCallBack({ column }) {
      if (column.property === 'number') {
        return { 'cursor': 'pointer' }
      }
    },

    // 选中的当前行
    selectionChangeHandle(data) {
      this.selecionList = data
    },

    // 点击单元格穿透详情
    clickCellHnalde(row, column) {
      if (column.property === 'number') {
        this.$router.push({ name: 'DeliveryForm', query: { id: row.id }})
      }
    },

    add() {
      this.$router.push({ name: 'DeliveryForm' })
    },
    remove() {
      if (this.selecionList.length < 1) {
        return this.$message.warning('请勾选要删除的行！')
      }

      this.$confirm('你确定要删除勾选行吗?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )
        .then(async() => {
          console.log(this.selecionList)
          console.log(this.$refs.editTableRef.$refs.elTable)
          const response = await delIntermediaryList(this.selecionList)
          if (response.code === 200) {
            this.$message.success('删除成功！')
            this.dataTableInit()
          }
        })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";
  .delivery ::v-deep  {
    .el-card__header {
      border-bottom: 2px solid $blue;
      position: relative;
      padding: 18px 0;
      margin: 0 20px;
    }
    .filter-btn-wrapper {
      display: flex;
      justify-content: flex-end;
    }

    .filter-label {
      min-width: 100px;
    }
  }
  .header-container, .project-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .project-wrapper {
    span{
      margin-right: 10px;
      font-size: 14px;
      font-weight: 700;
    }
  }

</style>
