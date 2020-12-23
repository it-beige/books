const baseToolBar = {
  label: '操作',
  hidden: false,
  width: '',
  minWidth: '',
  align: 'center',
  fixed: false
}
export default {

  name: 'EditDataTable',

  inheritAttrs: false,

  props: {
    head: {
      type: Array,
      required: true
    },
    rowKeyField: {
      type: String,
      default: 'id'
    },
    showSelection: Boolean,
    // 勾选限制
    selectLimit: {
      type: Number,
      default: -1
    },
    showNumber: Boolean,
    indexConfig: {
      type: Object,
      default: () => {
        return {
          indexName: '序号',
          indexWidth: '60',
          indexMethod: 0
        }
      }
    },
    toolBar: {
      type: Object,
      default: () => ({
        label: '操作',
        hidden: false,
        width: '',
        minWidth: '',
        align: 'center',
        fixed: false
      })
    },
    // 默认自适应当前屏高度
    height: {
      type: [String, Number],
      default: 'auto'
    },
    // 多级嵌套数据 user:{name:'名称'} prop可以定义成user.name
    showOverflowTooltip: { // 内容超出隐藏
      type: Boolean,
      default: true
    },
    // 没有分页
    noPagination: Boolean,
    // 是否可编辑
    editable: Boolean,
    // 显示新增行
    showAdd: Boolean
  },
  render(h) {

    const _this = this
    const columnRender = function(col, h) {
      if (col.hidden === true) return null
      if (!Object.prototype.hasOwnProperty.call(col, 'children') || col.children.length === 0) {
        if (col.hidden === true) return null
        return h(_this.editable ? 'elx-editable-column' : 'elx-table-column', {
          props: {
            ...col,
            width: col.width ? col.width.toString() : null,
            minWidth: col.minWidth ? col.minWidth.toString() : null,
            showOverflowTooltip: _this.$scopedSlots[col.prop] ? false : col.showOverflowTooltip !== undefined ? col.showOverflowTooltip : _this.showOverflowTooltip
          },
          key: col.columnKey || col.prop,
          scopedSlots: {
            header: (props) => {
              if (_this.$scopedSlots[col.prop + 'Header']) {
                return h('div', [
                  _this.$scopedSlots[col.prop + 'Header']({
                    ...props
                  })
                ])
              }
            },
            edit: (props) => {
              if (_this.$scopedSlots[col.prop + 'Edit']) {
                return h('div', [
                  _this.$scopedSlots[col.prop + 'Edit']({
                    ...props
                  })
                ])
              }
            },
            default: (props) => {
              if (_this.$scopedSlots[col.prop]) {
                return h('div', [
                  _this.$scopedSlots[col.prop]({
                    ...props
                  })
                ])
              } else {
                return h('span', {
                  style: col.cellStyle && typeof col.cellStyle === 'function'
                    ? col.cellStyle(_this._renderCellValue(props.row, props.column.property), props.row, props.column) : null,
                  domProps: {
                    innerHTML: (col.formatter && typeof col.formatter === 'function')
                      ? col.formatter(_this._renderCellValue(props.row, props.column.property), props.row, props.column, props.$index) : _this._renderCellValue(props.row, props.column.property)
                  }
                })
              }
            }
          }
        })
      } else {
        if (Array.isArray(col.children) && col.children.length) {
          return h(_this.editable ? 'elx-editable-column' : 'elx-table-column', {
            props: {
              ...col,
              width: col.width ? col.width.toString() : null,
              minWidth: col.minWidth ? col.minWidth.toString() : null
            },
            attrs: {
              label: col.label || col.prop
            }
          }, [...col.children.map(column => columnRender(column, h))]
          )
        }
        console.error(`[ETable warn] children need Array and can't be empty`)
        return null
      }
    }
    return h('div', {
      class: {
        'data-table-container': true,
        'no-pagination': _this.noPagination
      }
    }, [
      h(_this.editable ? 'elx-editable' : 'elx-table', {
        ref: 'elTable',
        props: {
          ...this.$attrs,
          editConfig: this.$attrs.config,
          rowKey: _this.rowKeyField,
          rowClassName: _this._tableRowClassName,
          height: _this.getTableHeight
        },
        on: {
          ...this.$listeners,
          'row-click': this._handleRowClick,
          'selection-change': this._handleSelection
        },
        directives: [{
          name: 'loading',
          value: _this.$attrs.loading
        }],
        scopedSlots: {
          empty: function() {
            return _this.$slots.empty
          },
          append: function() {
            return _this.$slots.append
          }
        }
      },
      [
        _this.showSelection ? h(_this.editable ? 'elx-editable-column' : 'elx-table-column', {
          props: {
            selectable: _this._cumSelectable
          },
          attrs: {
            type: 'selection',
            align: 'center',
            width: '60'
          }
        }) : null,
        _this.showNumber ? h(_this.editable ? 'elx-editable-column' : 'elx-table-column', {
          attrs: {
            type: 'index',
            label: _this.indexConfig.indexName,
            align: 'center',
            width: _this.indexConfig.indexWidth,
            index: _this.indexConfig.indexMethod,
          },
          scopedSlots: {
            header: (props) => {
              if (_this.$scopedSlots['indexHeader']) {
                return h('div', [
                  _this.$scopedSlots['indexHeader']({
                    ...props
                  })
                ])
              }
            },
          }
        }) : null,
        _this.head.map(col => columnRender(col, h)),
        !_this.getToolBar.hidden ? h(_this.editable ? 'elx-editable-column' : 'elx-table-column', {
          props: {
            ..._this.getToolBar,
            width: _this.getToolBar.width ? _this.getToolBar.width.toString() : null,
            minWidth: _this.getToolBar.minWidth ? _this.getToolBar.minWidth.toString() : null,
            'class-name': 'tool-bar'
          },
          scopedSlots: _this.$scopedSlots.toolbar ? {
            default: (props) => {
              return h('div', [
                _this.$scopedSlots.toolbar({
                  ...props
                })
              ])
            }
          } : null
        }) : null,
        Object.keys(_this.$slots).map(i => {
          return h('div', {
            slot: i
          }, _this.$slots[i])
        })
      ]),
      _this.showAdd ? h('div', {
        class: {
          'add-row-container': true
        },
        on: {
          click: _this.insertRow
        }
      },
      [
        h('i', {
          class: {
            'el-icon-circle-plus-outline': true
          }
        }),
        h('el-button', {
          attrs: {
            type: 'text'
          },
          domProps: {
            innerHTML: '新增行'
          }
        })
      ]) : null,
      _this.$attrs.total ? h('div', {
        ref: 'pageContainer',
        class: {
          'page-container': true
        }
      }, [
        h('el-pagination', {
          attrs: {
            layout: 'total, sizes, prev, pager, next, jumper',
            pageSize: _this.$attrs.offset,
            total: _this.$attrs.total
          },
          on: {
            ...this.$listeners,
            'current-change': _this._handlePageChange,
            'size-change': _this._handleSizeChange
          }
        })
      ]) : null
    ])
  },

  data() {
    return {
      selectionKey: '',
      tableHeight: 500
    }
  },
  computed: {
    getTableHeight() {
      if (this.height === 'auto') {
        return this.tableHeight
      } else if (this.height) {
        return this.height
      } else {
        return null
      }
    },
    getToolBar() {
      return Object.assign(baseToolBar, this.toolBar)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this._autoHeight()
    })
  },
  updated() {
    this.$nextTick(() => {
      this.doLayout()
    })
  },
  methods: {
    _autoHeight() {
      let pageHeight = this.$refs.pageContainer ? this.$refs.pageContainer.offsetHeight : 62
      if (this.noPagination) {
        pageHeight = 0
      }
      this.tableHeight = window.innerHeight - this.$refs.elTable.$el.getBoundingClientRect().top - 36 - pageHeight
    },
    _handleSelection(data) {
      if (this.selectLimit !== -1 && data.length > this.selectLimit) {
        for (let i = this.selectLimit; i < data.length; i++) {
          this.$refs.elTable.toggleRowSelection(data[i], false)
        }
        data = data.slice(0, this.selectLimit)
      }
      this.$emit('handleSelectionChange', data)
      this.$emit('selection-change', data)
      if (!data.length) {
        this.selectionKey = ''
        return
      }
      this.selectionKey = data.map(i => this._renderCellValue(i, this.rowKeyField))
    },
    _cumSelectable(row, index) {
      if (this.selectLimit === -1) {
        return true
      } else if (this.selectionKey.length >= this.selectLimit) {
        return this.selectionKey.includes(this._renderCellValue(row, this.rowKeyField))
      }
      return true
    },
    _tableRowClassName({ row, rowIndex }) {
      const rowClassNameFn = this.$attrs['row-class-name'] || this.$attrs.rowClassName
      if (rowClassNameFn) {
        const className = rowClassNameFn({ row, rowIndex })
        if (this.selectionKey.includes(this._renderCellValue(row, this.rowKeyField))) {
          return 'is-selection-row ' + className
        }
        return className
      }
      if (this.selectionKey.includes(this._renderCellValue(row, this.rowKeyField))) {
        return 'is-selection-row'
      }
      return ''
    },
    _handleRowClick(row, column) {
      if (this.showSelection && !this.editable) {
        this.$refs.elTable.toggleRowSelection(row)
      }
      this.$emit('row-click', row, column)
    },
    _handlePageChange(val) {
      this.$emit('current-change', val)
      this.$emit('handlePageChange', val)
    },
    _handleSizeChange(val) {
      this.$emit('size-change', val)
      this.$emit('handleSizeChange', val)
    },
    _renderCellValue(row, prop) {
      if (!prop) return
      if (prop.indexOf('.') !== -1) {
        const paths = prop.split('.')
        let current = row
        let result = null
        for (let i = 0, j = paths.length; i < j; i++) {
          const path = paths[i]
          if (!current) break
          if (i === j - 1) {
            result = current[path]
            break
          }
          current = current[path]
        }
        return result
      } else {
        return row[prop]
      }
    },

    doLayout() {
      this.$refs.elTable.doLayout()
    },
    insertRow(index = -1, data = {}) {
      this.$refs.elTable.insertAt(index, data).then(({ row }) => {
        this.$refs.elTable.setActiveCell(row)
      })
    },
    deleteRows(data = {}) {
      this.$refs.elTable.remove(data)
    },
    validate() {
      return new Promise((resolve, reject) => {
        if (!this.editable) {
          resolve()
          return
        }
        this.$refs.elTable.validate().then(() => {
          resolve(this.$attrs.data)
        }).catch(() => {
          reject('校验失败')
        })
      })
    }
  }
}
