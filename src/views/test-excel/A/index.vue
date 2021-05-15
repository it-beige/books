<template>
  <div class="A app-container">
    <el-card>
      <div slot="header" class="header-container">
        <div class="title">
          <label>项目名称：</label>
          <DynamicSelect
            ref="DynamicSelect"
            :value.sync="projectId"
            v-bind="projectSelectOption"
            :parse-data="parseData"
            :listeners="{
              dataChange: getCurItem
            }"
          />
        </div>
        <div class="button-wrapper">
          <el-button type="primary" @click="exportHandle">导出</el-button>
        </div>
      </div>

      <div class="table-warp">
        <!--动态搜索-->
        <dynamic-search
          ref="dynamicSearch"
          :data="tableFilterList(tableHead)"
          :search-span="24"
          @search="search"
        >
          <template v-slot:next />
        </dynamic-search>

        <!--表格-->

        <edit-data-table
          v-if="doLayout"
          show-summary
          :summary-method="getSummaries"
          :head="tableHead"
          :data.sync="pageList"
          row-key-field="id"
          :total="total"
          :page="page"
          border
          height="400"
          :index-config="indexConfig"
          :loading="loading"
          :offset="offset"
          :show-number="true"
          :tool-bar="{hidden: true}"
          @handlePageChange="dataTablePageChange"
          @handleSizeChange="dataTableSizeChange"
        >
          <!-- 自定义序号 -->
          <template #indexHeader>
            序号
          </template>
        </edit-data-table>
      </div>
    </el-card>
  </div>
</template>

<script>
// 表格数据刷新和翻页功能
import DataTableMixin from '@/mixins/DataTableMixin'
// 导出依赖的方法
import exportMixin from '@/mixins/exportMixin'
import DynamicSelect from '@/components/common/DynamicSelect'
import { requestUrl } from '@/api/constant'
import {
  getAllListData
} from '@/api/report/getAllList'

import {
  config as configMixin,
  initTableHead,
  createDateColumnAction,
} from './config/indexConfig'
import {
  chainCallBacks,
  formatThouPercentile,
  mergeObjDebarEmpty,
  deepObjectMerge,
  parseTime,
} from '@/utils'
import { calc } from '@/utils/calc.js'

export default {
  name: 'TestExcelA',
  components: {
    DynamicSelect
  },
  mixins: [DataTableMixin, configMixin, exportMixin],
  data() {
    return {
      title: '北歌-测试报表导出',
      projectId: '',
      selectedProject: {},
      doLayout: true, // 解决column缓存丢失问题
    }
  },
  computed: {
    /**
     * @description:
     * @param {Array} list 列表数据
     * @param {Array} amountFields 金额字段
     * @return {*}
     */
    pageList({ list = [], amountFields }) {
      if (!list.length) {
        return []
      } else {
        return this.formaterList(list, amountFields)
      }
    }
  },
  watch: {
    'list.length': {
      handler(len) {
        if (!len) {
          // 没有数据(还原表头)
          this.tableHead = initTableHead
          return
        }

        const {
          rentStartDate, // 开始日期(2022-04)
          rentEndDate // 结束日期(2021-04)
        } = this.$refs.dynamicSearch.searchQuery

        this.doLayout = false
        this.$nextTick(() => {
          this.tableHead = this.createDynamicHead({
            year: rentStartDate.substr(0, 4),
            startDate: rentStartDate,
            endDate: rentEndDate,
          })
          this.doLayout = true
        })
      }
    }
  },
  created() {
    this.setDynamicSearchVal(['printDate'])
  },
  methods: {
    /**
     * @description:
     * @param {Array} list 列表数据
     * @param {Array} amountFields 金额字段
     * @return {*}
     */
    formaterList(list, amountFields) {
      return list.map(row => {
        row.costTableEntrys.forEach(i => {
          amountFields.forEach(key => {
            i[key] = Number(i[key]).toFixed(2)
          })
        })
        return row
      })
    },

    /**
     * @description: 根据查询的数据获取现有数据的日期
     * @param {String} year 年份
     * @param {String} startDate 开始日期
     * @param {String} endDate 结束日期
     * @return {Array} 动态生成的表头
     */
    createDynamicHead({ year, startDate, endDate }) {
      const {
        differenceInMonths,
        monthHash
      } = this
      // 获得开始日期和结束相差月份(2022-04 - 2021-04) = 12
      const diffMonthNum = differenceInMonths(startDate, endDate)
      // 根据条件匹配出所选月份范围
      const selectMonthScope = []
      // 开始月份的索引(04 -> 3)
      let startIndex = monthHash.indexOf(startDate.substr(-2))

      let n = diffMonthNum + 1
      while (n--) {
        const m = monthHash[startIndex]
        selectMonthScope.push({
          label: `${year}-${m}`,
          prop: `${year}-${m}`,
          isDynamic: true, // 动态标识
        })
        // 跨年的情况
        if (m === '12') {
          year = Number(year) + 1
          startIndex = 0
        } else {
          startIndex++
        }
      }

      // 生成日期表头
      return [...initTableHead, ...createDateColumnAction(selectMonthScope)]
    },

    /**
     * @description: 拉取列表数据
     */
    dataTableBeforeInit() {
      const {
        page,
        offset,
        projectId,
        _query: {
          rentStartDate,
          rentEndDate,
        } = {},
        _query
      } = this
      this._url = requestUrl.getTestAExportData
      if (projectId && rentStartDate && rentEndDate) {
        delete _query['printDate']
        const params = {
          pageIndex: page,
          pageSize: offset,
          projectId,
          rentStartDate,
          rentEndDate
        }
        this._params = Object.assign(params, _query)
        return true
      }

      return false
    },

    /**
     * @description: 汇总
     * @param {Array} columns 所有列表
     * @param {Array} data 所有数据
     */
    getSummaries({ columns, data }) {
      const {
        getHeaderFields,
        formatJson,
        calcArrayTotal,
        noTotalFields
      } = this
      const sums = ['', '汇总']
      if (!data.length || !columns.length) return sums
      const {
        tableHead
      } = this
      // 获取展示的所有列
      const cols = getHeaderFields(tableHead)

      // 将数每行格式化成想要的数据值
      const formatData = formatJson(cols, data)
      console.log(formatData)

      // 合计计算
      const totalObj = calcArrayTotal(
        formatData,
        cols,
        calc.Add
      )

      const diffCol = columns.length - cols.length
      cols.forEach(c => {
        if (Reflect.has(c, 'index') && !noTotalFields.includes(c.property)) {
          sums[c.index + diffCol] = formatThouPercentile(
            totalObj[`${c.parentKey}${c.prop}`].toFixed(2)
          )
        }
      })

      return sums
    },

    /**
     * @description: 参数校验
     * @param {Object} val
     */
    validateParams(val) {
      let tip = ''
      switch (true) {
        case !val['projectId']:
          tip = '请选择项目！'
          break
        case (!val['rentStartDate']):
          tip = '请选择开始日期！'
          break
        case (!val['rentEndDate']):
          tip = '请选择结束日期！'
          break
      }
      if (
        new Date(val['rentEndDate']).getTime() <
        new Date(val['rentStartDate'])) {
        tip = '结束日期不能早于开始日期！'
      }
      return tip
    },

    /**
     * @description: 查询
     * @param {Object} val 查询的参数
     * @param {Boolean} status 是否调用接口进行查询 false -> 调用
     * @return {*}
     */
    search(val = {}, status) {
      const {
        id: projectId,
      } = this.selectedProject
      const noPass = this.validateParams(
        Object.assign(
          val,
          { projectId }
        )
      )

      if (!status && noPass) {
        return this.$message.error(noPass)
      }

      this.dataTableSearch(val, status)
    },

    /**
     * @description: 获取项目对象
     */
    getCurItem(project = {}) {
      this.selectedProject = project
    },

    /**
     * @description: 设置报表打印日期
     */
    setDynamicSearchVal(fields = []) {
      this.$nextTick()
        .then(() => {
          fields.forEach(f => {
            this.$set(
              this.$refs.dynamicSearch.searchQuery,
              f,
              new Date()
            )
          })
        })
    },

    /**
     * @description: 解析列表数据
     */
    parseData(data) {
      return { data: data.data.pageData }
    },

    /**
     * @description: 获取全量数据
     * @param {Object} mustParams 必传参数
     * @param {Object} selectParams 可选参数
     * @return {Array} 全量数据
     */
    async _getAllListData(mustParams, selectParams) {
      const res = await getAllListData(
        requestUrl.getAllTestAExportData,
        mergeObjDebarEmpty(mustParams, selectParams)
      )

      const {
        pageData = []
      } = res.data

      // 全量数据
      return pageData
    },

    // 导出
    async exportHandle() {
      // 生成一个_attrs对象存放exportHandle方法执行中所产生的所有变量
      const _attrs = this.generateAttrs()
      const {
        rentStartDate,
        rentEndDate,
        projectId,
        billNumber,
        feeId,
      } = _attrs

      const {
        validateParams, // 校验参数
        _getAllListData, // 获取全量数据
        generateExcel, // 生成excel
      } = this

      // 链式调用回调，优化当前函数的代码体量
      chainCallBacks([
        (next) => {
          const noPass = validateParams({
            rentStartDate,
            rentEndDate,
            projectId,
          })
          if (noPass) {
            return this.$message.error(noPass)
          }
          // 往下走
          next()
        },
        async(next) => {
          this.$store.state.isShowLoading = true
          const mustParams = {
            rentStartDate,
            rentEndDate,
            projectId,
            pageIndex: 1,
            pageSize: 1000, // 全量数据(后端必须要传条件)
          }
          // 可选参数(没值就不传)
          const selectParams = {
            billNumber,
            feeId
          }
          const data = await _getAllListData(mustParams, selectParams)
          _attrs.list.push(...data)
          if (!_attrs.list.length) {
            this.$store.state.isShowLoading = false
            return this.$message.error('没有符合当前条件的数据可以导出!')
          }
          _attrs.mustParams = mustParams
          _attrs.selectParams = selectParams

          // 往下走
          next()
        },
        () => {
          import('@/utils/EXPORT2EXCEL')
            .then(generateExcel.bind(null, _attrs))
        }
      ])
    },

    generateAttrs() {
      const {
        selectedProject: {
          id: projectId, // 项目
          proName, // 项目名称
        },
        $refs: {
          // 筛选参数
          dynamicSearch: {
            searchQuery: {
              rentStartDate, // 开始日期
              rentEndDate, // 结束日期
              billNumber, // 合同编号
              printDate, // 报表打印日期
              feeId, // 费项
            }
          } = {}
        }
      } = this

      return new Proxy({
        projectId,
        feeId,
        rentStartDate,
        rentEndDate,
        billNumber,
        printDate,
        proName,
        list: [] // 全量数据
      },
      {
        // 对象key名不能重复(防止覆盖)
        set(_attrs, prop, val) {
          if (Reflect.has(_attrs, prop)) {
            throw Error(`Duplicate key name at ${prop}`)
          }
          return Reflect.set(_attrs, prop, val)
        }
      })
    },

    generateExcel(_attrs, excel) {
      const {
        setHeaderInfo,
        createDynamicHead,
        getMultiHeader,
        formatJson,
        generateExcelDynamicFilterHead,
        exportJsonToExcel,
      } = this

      const {
        list,
        rentStartDate,
        rentEndDate,
      } = _attrs
      _attrs.excel = excel

      chainCallBacks([
        // 给表头加上对应的层级
        (next) => {
          const {
            tableHead,
            cols, // 所有的列
            maxLevel, // 最大的层级，当前表头有几行
          } = setHeaderInfo(
            // 动态获取表头
            createDynamicHead({
              list,
              year: rentStartDate.substr(0, 4),
              startDate: rentStartDate,
              endDate: rentEndDate,
            })
          )
          _attrs.tableHead = tableHead
          _attrs.cols = cols
          _attrs.maxLevel = maxLevel
          next()
        },
        // 根据表的层级结构计算出表头的行数
        (next) => {
          const {
            tableHead,
            maxLevel,
            cols
          } = _attrs
          /** *****************  组建excel表头 *******************/
          const {
            multiHeaders,
          } = getMultiHeader({
            tableHead,
            // 不能用fill: 因为fill对于object都是同一个引用地址
            multiHeaders: Array.from(Array(maxLevel + 1)).map(() => [])
          })
          // 将表头和字段对应上
          const data = formatJson(cols, list)
          _attrs.data = data
          _attrs.multiHeaders = multiHeaders
          next()
        },
        // 动态生成一行汇总
        (next) => {
          const {
            calcArrayTotal,
            noTotalFields
          } = this
          const {
            data,
            cols
          } = _attrs
          const totalObj = calcArrayTotal(data, cols, calc.Add)
          const sums = ['汇总']
          cols.forEach((c) => {
            if (Reflect.has(c, 'index') && !noTotalFields.includes(c.property)) {
              sums[c.index] = formatThouPercentile(
                totalObj[`${c.parentKey}${c.prop}`].toFixed(2)
              )
            } else if (c.index !== 0) {
              sums[c.index] = ''
            }
          })
          // 将汇总添加最后一行
          data.push(sums)
          next()
        },
        // 生成动态过滤条件的表头
        generateExcelDynamicFilterHead.bind(this, _attrs),
        // 使用插件完成excel的生成
        exportJsonToExcel.bind(this, _attrs)
      ])
    },

    generateExcelDynamicFilterHead(_attrs, next) {
      const {
        // 生成可选参数的动态表头
        generateExcelSelectDynamicFilterHead
      } = this

      const {
        multiHeaders,
        proName,
        rentStartDate,
        rentEndDate,
        printDate,
      } = _attrs
      /** *****************  组建excel合并 *******************/
      _attrs.dynamicFilterHeads = []
      _attrs.dynamicFilterMerges = [] // 过滤的表头的合并
      _attrs.merges = [] // 表头的合并

      /* 存在条件过滤需要将过滤条件也生成表头 */
      // TODO 空格 -> 留点空格占excel的单元格位置
      _attrs.tableHeadLength = multiHeaders[0].length // 表头的长度
      _attrs.filterHeadArr = Array(_attrs.tableHeadLength).fill('      ')
      _attrs.filterBodyArr = Array(_attrs.filterBodyArr).fill('      ')

      /* head */
      _attrs.filterHeadArr[0] = '当前项目名称'
      _attrs.filterHeadArr[1] = '开始日期'
      _attrs.filterHeadArr[2] = '结束日期'
      _attrs.filterHeadArr[3] = '报表打印日期'

      /* body */
      _attrs.filterBodyArr[0] = proName
      _attrs.filterBodyArr[1] = rentStartDate
      _attrs.filterBodyArr[2] = rentEndDate
      _attrs.filterBodyArr[3] = printDate
        ? parseTime(printDate, '{y}-{m}-{d}')
        : ''

      /* mergeCeel */
      _attrs.merges.push(...[
        'A1:A3',
        'B1:B3',
        'C1:C3',
        'D1:D3',
      ])
      _attrs.dynamicFilterMerges.push(...[
        'A1',
        'B1',
        'C1',
        'D1',
      ])

      generateExcelSelectDynamicFilterHead(_attrs)
      next()
    },

    generateExcelSelectDynamicFilterHead(_attrs) {
      const {
        mergesCellsActions
      } = this
      const {
        dynamicFilterMerges,
        selectParams,
        filterHeadArr,
        filterBodyArr,
        excel,
        merges
      } = _attrs

      // 可选参数的表格
      const selectCount = Object.values(selectParams)
        .reduce((selectCount, v) => {
          return v ? ++selectCount : selectCount
        }, 0)

      if (selectCount) {
        let n = dynamicFilterMerges.length - 1
        if (selectParams['billNumber']) {
          const i = ++n
          filterHeadArr[i] = '合同编号'
          filterBodyArr[i] = selectParams['billNumber']
        }

        if (selectParams['feeId']) {
          const i = ++n
          filterHeadArr[i] = '费项名称'
          filterBodyArr[i] = this.costList.find(i => {
            return i['value'] === selectParams['feeId']
          })?.label
        }

        // 生成单元格
        let i = selectCount
        let cellN = 3
        while (i--) {
          ++cellN
          const letter = excel.cellName[cellN]
          merges.push(`${letter}1:${letter}3`)
          dynamicFilterMerges.push(`${letter}1`)
        }
      }

      mergesCellsActions(_attrs)
    },

    /**
     * @description: 合并单元格操作
     * @param {Object} _attrs exportHandle中的变量对象
     * @return {*}
     */
    mergesCellsActions(_attrs) {
      const {
        dynamicFilterHeads,
        filterHeadArr,
        tableHeadLength,
        filterBodyArr,
        merges
      } = _attrs

      dynamicFilterHeads.push(
        filterHeadArr,
        Array(tableHeadLength).fill('      '),
        Array(tableHeadLength).fill('      '),
        filterBodyArr,
        Array(tableHeadLength).fill('      '),
      )

      // 数据表格的起始行数 = 动态表格占用的行数 + 1
      const startRow = dynamicFilterHeads.length + 1

      merges.push(...[
        `A${startRow}:A${startRow + 1}`,
        `B${startRow}:B${startRow + 1}`,
        `C${startRow}:C${startRow + 1}`,
        `D${startRow}:D${startRow + 1}`,
        `E${startRow}:E${startRow + 1}`,
        `F${startRow}:F${startRow + 1}`,
        `G${startRow}:G${startRow + 1}`,
        `H${startRow}:H${startRow + 1}`,
      ])

      _attrs.startRow = startRow
    },

    // excel-自定义样式
    customRowStyleCallBack(_attrs, dataInfo, data) {
      const {
        merges,
        startRow,
        excel,
        dynamicFilterMerges
      } = _attrs
      const mergesCells = merges.map(i => i.split(':')?.[0])

      for (var b in dataInfo) {
        // 给个默认值(防止出错)
        b ??= ''
        // 自定义表头的样式
        if (new RegExp(`^[A-Z]+[${startRow}|${startRow + 1}]$`).test(b)) {
          dataInfo[b].s = excel.firstTableHeadStyle
        }

        // 过滤的表头
        if (dynamicFilterMerges.includes(b)) {
          dataInfo[b].s = excel.firstTableHeadStyle
        } else if (mergesCells.includes(b)) { // 给合并后的表头加下边框
          deepObjectMerge(
            dataInfo[b].s ??= {},
            {
              border: {
                bottom: {
                  style: 'thin'
                }
              },
            }
          )
        }

        // 给最后一行汇总也加上表头一样的样式
        if (new RegExp(`^[A-Z]+${data.length}$`).test(b)) {
          dataInfo[b].s = excel.firstTableHeadStyle
        }
      }
    },

    exportJsonToExcel(_attrs) {
      const {
        multiHeaders,
        dynamicFilterHeads,
        proName,
        merges,
        data,
        excel
      } = _attrs
      const {
        customRowStyleCallBack,
      } = this
      excel.export_json_to_excel({
        multiHeaders,
        dynamicFilterHeads,
        data,
        filename: `${proName}-项目合同费用表（应收）`,
        merges, // 合并表头
        customRowStyleCallBack: customRowStyleCallBack.bind(this, _attrs), // 自定义行的样式
      })
        .then(res => {
          this.$notify({
            title: res.message,
            type: 'success',
            duration: 2500
          })
        })
        .catch((err) => {
          this.$message.error('导出失败!')
          console.error(err)
        })
        .finally(() => {
          this.$store.state.isShowLoading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
@import '@styles/variables.scss';

.A {
  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      color: $green;
    }
  }
}

.A ::v-deep {
  .filter-item-custom {
     .filter-label {
      min-width: 90px;
    }
  }
}
</style>

