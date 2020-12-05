import { initData } from '@/api/data'
import { getTables } from '@/api/table'
const DEFAULT_PAGE = 1
const dataTableMixin = {
  data() {
    return {
      loading: true,
      url: '',
      page: DEFAULT_PAGE,
      size: 10,
      data: [],
      params: {},
      query: {},
      tableHead: [],
      pageInfo: {
        total: 0,
        pageSizes: [10, 20, 50, 1000, 200],
        offset: 10, // 每页显示多少条
      },
      controlBar: ['edit', 'delete', 'refresh', 'column', 'search'],
      time: 170,
      isAdd: false,
      showSearch: true
    }
  },
  methods: {
    async init() {
      if (!await this.beforeInit()) {
        return
      }
      return new Promise((resolve, reject) => {
        this.loading = true
        // 仅获取数据
        if (this.url && this.url !== '') {
          initData(this.url, this.params).then(res => {
            this.pageInfo.total = res.data.total
            this.data = res.data.records || res.data
            setTimeout(() => {
              this.loading = false
            }, this.time)
            resolve(res)
          }).catch(err => {
            this.loading = false
            reject(err)
          })
        } else {
          // 获取表格表头配置，及数据体
          getTables(this.params).then(res => {
            this.tableHead = res.data.tableColumn
            this.pageInfo.total = res.data.totalElements
            this.data = res.data.content
            setTimeout(() => {
              this.loading = false
            }, this.time)
            resolve(res)
          }).catch(err => {
            this.loading = false
            reject(err)
          })
        }
      })
    },
    beforeInit() {
      return true
    },
    pageChange(val) {
      // this.page = val - 1
      this.page = val
      this.init()
    },
    sizeChange(val) {
      this.page = DEFAULT_PAGE
      this.size = val
      this.init()
    },
    dynamicSearch(val, status) {
      this.page = DEFAULT_PAGE
      this.query = val
      if (!status) this.init()
    },
    // 重置搜索
    resetSearch(obj) {
      this.query = obj
      this.page = 1
      this.init()
    },
    // 预防删除第二页最后一条数据时，或者多选删除第二页的数据时，页码错误导致请求无数据
    dleChangePage(size) {
      if (size === undefined) {
        size = 1
      }
      if (this.data.length === size && this.page !== DEFAULT_PAGE) {
        this.page = this.page - 1
      }
    },
    tableFilterList(data) {
      if (data instanceof Array) {
        const arr = []
        const res = []
        data.forEach(i => {
          if (i.query) {
            if (i.query.type === 'group-input') {
              const obj = {
                label: i.label,
                value: i.property,
              }
              arr.push(obj)
            } else {
              const obj = {
                type: i.query.type,
                label: i.label,
                key: i.property,
                data: i.query.data,
                value: i.query.value,
                filterHeader: i.filterHeader // 为了统一去设置头部筛选框的边距样式
              }
              if (i.query.hidden !== undefined) {
                Object.assign(obj, { hidden: i.query.hidden, })
              }
              res.push(obj)
            }
          }
        })
        if (arr.length) {
          const obj = {
            type: 'group-input',
            key: 'groupInput',
            data: arr
          }
          res.push(obj)
        }
        return res
      }
      return data
    },
  }
}
export default dataTableMixin
