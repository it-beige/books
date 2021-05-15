
const configMixin = {
  data() {
    return {

    }
  },
  methods: {
    /**
     * @description: 设置表头层级信息
     * @param {Array} tableHead 表头List
     * @param {Number} level 层级信息
     * @param {numbers } cols 所有列
     * @return {*}
     */
    setHeaderInfo(tableHead, level = 0, cols = []) {
      for (let i = 0, len = tableHead.length; i < len; i++) {
        const col = tableHead[i]
        // [隐藏的列, 不存在prop的字段] 不展示
        if (col.hidden || !col.prop) {
          continue
        }

        col.level = level

        if (col.children?.length) {
          this.setHeaderInfo(col.children, level + 1, cols)
        } else {
          // 父级不需要放在数据列中
          cols.push(Object.assign(col, { property: col.prop }))
        }
      }
      return {
        tableHead,
        cols,
        maxLevel: Math.max(...cols.map(c => c.level))
      }
    },

    /**
      * @description: 动态组建excel的表头层级(children的层级代表了表头的行数)
      * @param {Array} tableHead
      * @return {*}
      * @Date Changed:
      *
      * excel表头的行数
      * excel最大的长度
    */
    getMultiHeader(params) {
      const {
        tableHead = [],
        multiHeaders = [], // 存储每一行的表头
      } = params
      for (let i = 0, len = tableHead.length; i < len; i++) {
        const col = tableHead[i]
        // [隐藏的列, 不存在prop的字段] 不展示
        if (col.hidden || !col.prop) {
          continue
        }

        // 递归处理子级
        if (col.children?.length) {
          /* 如果有子级，父级只有一个单元格有文字，其他用空串占位 */
          // col.level -当前表头的层级
          // 处理当前行
          multiHeaders[col.level].push(col.label)
          let j = 1
          while (j < col.children.length) {
            // 留点空格占excel的单元格位置
            multiHeaders[col.level].push('    ')
            j++
          }

          // 处理下一行
          !multiHeaders[col.level + 1].length
            ? multiHeaders[col.level + 1].push(...Array(
              multiHeaders[col.level].length - col.children.length
            ).fill(''))
            : null
          this.getMultiHeader({
            tableHead: col.children,
            multiHeaders
          })
          continue
        } else {
          multiHeaders[col.level].push(col.label)
        }
      }

      return { tableHead, multiHeaders }
    },

    // 获取tableHead中所有展示col
    getHeaderFields(tableHead) {
      return tableHead.reduce((headers, i) => {
        // [隐藏的列, 不存在prop的字段] 不展示
        if (i.hidden || !i.prop) return headers

        // 递归处理子级
        if (i.children?.length) {
          headers.push(...this.getHeaderFields(i.children))
          return headers
        } else {
          headers.push(Object.assign(i, {
            property: i.prop
          }))
        }

        return headers
      }, [])
    },

    /**
     * @description: 格式化数据
     * @param {Array} headerFields 表头
     * @param {Array} jsonData 数据
     * @return {Array} 格式化好的每个单元格的数据
     */
    formatJson(headerFields, jsonData) {
      return jsonData.map(row => headerFields.map(col => {
        return typeof col.formatter === 'function'
        // 后两个参数存粹是为了过formatter的校验
          ? col.formatter({ row, column: col, col })
          : row[col.prop]
      }))
    },

    /**
     * @description: 合计Array指定字段数据
     * @param {Array} list 合计的Array
     * @param {Array} amountField 要合计的字段
     * @param {Function} operate 根据什么操作符进行合计
     * @return {Object} 合计好的数据汇总
     * @Date Changed:
     */
    calcArrayTotal(list = [], cols = [], operate) {
      const {
        noTotalFields
      } = this
      if (!list.length || !cols.length) {
        return new Error('arg1 And arg2 must Array !')
      }

      if (typeof operate !== 'function') {
        return new Error('operate must!')
      }

      // 记录列的index
      const setColIndex = ({ cols, row }) => {
        let j = 0
        while (j < row.length) {
          // 获取字段对应索引
          if (!noTotalFields.includes(p)) {
            cols[j].index = j
          }
          j++
        }
      }

      const props = cols.map(c => {
        const p = c.prop || c.property
        if (!noTotalFields.includes(p)) {
          return `${c.parentKey}${p}`
        } else {
          return p
        }
      })

      const retObj = {} // 汇总后对象
      let p = ''
      for (let i = 0, len = list.length; i < len; i++) {
        const row = list[i]

        // 记录列的index(循环第一行的时候就可以确认了， 后面不需要再重复操作)
        if (i === 0) {
          setColIndex({ cols, row })
        }

        let j = 0
        while (j < row.length) {
          p = props[j]

          if (!noTotalFields.includes(p)) {
            // 第一次循环初始化汇总对象的值
            if (i === 0) {
              retObj[p] ??= 0
            }

            let v = row[j]
            // 加了千分符需要将千分符去掉
            if (typeof v === 'string') {
              v = v.replace(/,+/g, '')
            }

            // 汇总
            retObj[p] = operate(retObj[p], Number(v))
          } else {
            retObj[p] = ''
          }

          j++
        }
      }

      return retObj
    },

    /**
     * @description: 比较两个日期之前相差的月份
     * @param {String} startDateStr 开始日期
     * @param {String} endDateStr 结束日期
     * @return {Number} 相差的月份
     */
    differenceInMonths(startDateStr, endDateStr) {
      const {
        monthHash
      } = this
      const [startYear, startMonth] = startDateStr.split('-')
      const [endYear, endMonth] = endDateStr.split('-')
      const diffYear = (+endYear) - (+startYear)
      const diffMonth = (+endMonth) - (+startMonth)
      return (diffYear * monthHash.length) + (diffMonth)
    }
  }
}

export default configMixin
