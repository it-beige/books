/* eslint-disable */
import {initData} from "@/api/dataTable";
import { requestUrl } from '@/api/constant'

const DEFAULT_PAGE = 1
const DataTableMixin = {
  data() {
    return {
      _url: '',
      _params: {},
      _query: {},
      page: DEFAULT_PAGE,
      offset: 20,
      loading: false, // 是否在加载数据
      list: [], // 数据列表
      total: 0,
      _dataField: null,
      projectSelectOption: {
        url: requestUrl.getProjectList,
        props: {label: 'proName',value: 'id'},
        params: {status: 1, pageSize: 1000, pageIndex: 1},
        searchKey: "projectName",
        clearable: true,
        filterable: true
      }
      
    }
  },
  methods: {
    objectKeyIsEmpty(obj) {
      let empty = null
      let keyRet = ''
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === null || obj[key] === '') {
            delete(obj[key])
          }
        }
      }
      return obj
    },
    /**
     * 拉取数据
     * @returns {Promise<any>}
     */
    async dataTableInit() {
      if (!await this.dataTableBeforeInit()) {
        return
      }
      return new Promise((resolve, reject) => {
        this.loading = true
        let request = null
        // 判断是否有挂载$http
        if (this.$http && this.$http.get) {
          request = this.$http.get(this._url, {
            params: this.objectKeyIsEmpty(this._params)
          })
        } else {
          request = initData(this._url, this.objectKeyIsEmpty(this._params))
        }
        request.then(res => {
          if (res.data && res.data.pageData instanceof Array) {
            this.list = res.data.pageData
            this.total = res.data.totalCount
          } else if (res.data instanceof Array && res.data.length) {
            this.list = res.data
          } else {
            this.list = []
          }
          if (this._dataField) {
            this.list = this.list.map(i => i[this._dataField])
          }
          setTimeout(() => {
            this.loading = false
          }, 170)
          resolve(res)
        }).catch(err => {
          this.loading = false
          reject(err)
        })
      })
    },

    /**
     * 初始化参数
     * @returns {boolean}
     */
    dataTableBeforeInit() {
      return true
    },

    /**
     * 翻页
     * @param val
     */
    dataTablePageChange(val) {
      this.page = val
      this.dataTableInit()
    },

    /**
     * 改变每页大小
     * @param val
     */
    dataTableSizeChange(val) {
      this.page = DEFAULT_PAGE
      this.offset = val
      this.dataTableInit()
    },

    /**
     * 搜索
     * @param val
     */
    dataTableSearch(val, status) {
      /* 2020/08/13 
      暂不知道dynamic-search 中search事件关联逻辑，从而修改 此搜索逻辑方法
      判断 当表单控件被修改时候也触发这个搜索，重置了total造成了分页器不显示
      this.page = DEFAULT_PAGE
      this.total = 0
      */
      if (val) {
        this._query = val
      }
      if (!status) {
        // 2020/08/13 修改逻辑 
        this.page = DEFAULT_PAGE
        this.total = 0
        this.list = [] // 数据列表
        this.dataTableInit()
      }
    },

    // 重置搜索
    dataTableReset(obj) {
      this.query = obj
      this.page = 1
      this.init()
    },


    // 预防删除第二页最后一条数据时，或者多选删除第二页的数据时，页码错误导致请求无数据
    dleTableChangePage(size) {
      if (size === undefined) {
        size = 1
      }
      if (this.list.length === size && this.page !== DEFAULT_PAGE) {
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
                value: i.property || i.prop
              }
              arr.push(obj)
            } else if (i.query.type === 'databox') {
              const obj = {
                type: i.query.type,
                label: i.label,
                key: i.property || i.prop,
                ...i.query
              }
              if (i.query.hidden !== undefined) {
                Object.assign(obj, { hidden: i.query.hidden })
              }
              res.push(obj)
            } else {
              const obj = {
                type: i.query.type,
                label: i.query.label || i.label,
                key: i.property || i.prop,
                data: i.query.data,
                value: i.query.value,
                labelKey: i.query.labelKey,
                valueKey: i.query.valueKey,
                itemClass: i.query.className,
                ...i.query
              }
             
              if (i.query.hidden !== undefined) {
                Object.assign(obj, { hidden: i.query.hidden})
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
    }
  }
}

export default DataTableMixin
