import DictInitMixin from '@/mixins/DictInitMixin'
import { formatThouPercentile } from '@/utils'
const key = 'rentPeriod'

const monthHash = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
]

// 关键金额字段
const amountFields = [
  'receivableTaxIncluded',
  'receivableExcludingTax',
]

// 不合计的字段
const noTotalFields = [
  'billNumber',
  'customerName',
  'unitNumber',
  'rentalArea',
  'startDate',
  'endDate',
  'actualEndDate',
  'feeName',
]

const self = {}

const formatterThousand = ({ row, column, col }) => {
  if (row && row.costTableEntrys && column && col) {
    const curItem = row.costTableEntrys.find(i => {
      return i[key] === col['parentKey']
    }) || {}

    const realValue = Number(curItem[column.property] || 0).toFixed(2)
    // 支持负数千分
    const v = String(realValue).replace('-', '') // 去了分号的数
    // 千分位展示
    return v > 999 ? formatThouPercentile(realValue) : realValue
  }
}

const initTableHead = [
  {
    label: '开始日期',
    prop: 'rentStartDate',
    query: {
      type: 'date',
      dateType: 'month',
      valueFormat: 'yyyy-MM',
      itemClass: 'filter-item-custom',
    },
    hidden: true
  },
  {
    label: '结束日期',
    prop: 'rentEndDate',
    query: {
      type: 'date',
      dateType: 'month',
      valueFormat: 'yyyy-MM',
    },
    hidden: true
  },
  {
    label: '合同编号',
    prop: 'billNumber',
    align: 'center',
    minWidth: '150',
    fixed: 'left',
    query: {
      type: 'input'
    },
  },
  {
    label: '客户名称',
    align: 'center',
    minWidth: '150',
    fixed: 'left',
    prop: 'customerName'
  },
  {
    label: '租赁单元',
    align: 'center',
    minWidth: '130',
    fixed: 'left',
    prop: 'unitNumber'
  },
  {
    label: '租赁面积',
    align: 'center',
    minWidth: '160',
    fixed: 'left',
    prop: 'rentalArea'
  },
  {
    label: '租赁开始日期',
    align: 'center',
    minWidth: '130',
    prop: 'startDate'
  },
  {
    label: '租赁结束日期',
    align: 'center',
    minWidth: '130',
    prop: 'endDate'
  },
  {
    label: '实际结束日期',
    align: 'center',
    minWidth: '130',
    prop: 'actualEndDate'
  },
  {
    label: '费项',
    prop: 'feeName',
    minWidth: '160',
    align: 'center',
    query: {
      type: 'select',
      data: [],
      key: 'feeId',
    },
  },
  {
    label: '报表打印日期',
    prop: 'printDate',
    query: {
      type: 'date',
      span: 6,
      valueFormat: 'yyyy-MM-dd',
      disabled: true,
    },
    hidden: true
  },
]

// 根据monthToHash中所选月份动态生成动态列
const createDateColumn = (dynamicColumns) => {
  return dynamicColumns.map(col => {
    return Object.assign(col, {
      minWidth: '160',
      align: 'center',
      children: [
        {
          label: '含税金额',
          prop: `receivableTaxIncluded`,
          minWidth: '160',
          align: 'center',
          formatter: formatterThousand,
          parentKey: col.prop,
        },
        {
          label: '不含税金额',
          minWidth: '160',
          prop: `receivableExcludingTax`,
          align: 'center',
          formatter: formatterThousand,
          parentKey: col.prop,
        },
      ]
    })
  })
}

// 动态生成过表头就只替换表头的年份
const replaceHeadYear = (year) => {
  self.tableHead.forEach(i => {
    if (i.isDynamic) {
      i.label = `${year}${i.label.substr(4)}`
      i.prop = `${year}${i.prop.substr(4)}`
    }
  })
}

const indexConfig = {
  indexName: '序号',
  indexWidth: '60',
  indexMethod: 0,
  fixed: 'left'
}

const config = {
  mixins: [DictInitMixin],
  data() {
    return {
      tableHead: initTableHead,
      indexConfig: Object.freeze(indexConfig),
      amountFields: Object.freeze(amountFields),
      monthHash: Object.freeze(monthHash),
      noTotalFields: Object.freeze(noTotalFields)
    }
  },
}

export {
  config,
  initTableHead,
  createDateColumn as createDateColumnAction,
  replaceHeadYear,
}

/*
EditDataTable:(表格)
  - head: 表头信息
  - data.sync: v-model绑定list(该组件是用render函数实现)
  - row-key-field: 每一行的当做key的字段
  - total: 分页的总条目数
  - page: 分页的总页变量
  - border: 边框
  - height：给表格高度让其固定表头
  - index-config: 序号列的配置(show-number为true生效)
  - loading: 加载的loading
  - offset: 偏移量(也是就当前pageSize)
  - tool-bar: 操作列（这里不渲染）
  - handlePageChange: 翻页
  - handleSizeChange：变量一页展示的条数

  DynamicSearch:(表单)
    - data: 根据tableHead中的query来动态生成表单项类型
    - searchSpan="查询按钮容器占的span"(整个表单是用el-row包着的)

*/
