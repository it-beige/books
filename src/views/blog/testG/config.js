const config = {
  data() {
    return {
      tableHead: [
        {
          prop: 'genusProject',
          label: '项目',
          align: 'center',
        },
        {
          prop: 'tableName',
          label: '表名',
          align: 'center',
          query: {
            type: 'input'
          }
        },
        {
          prop: 'tableNumber',
          label: '表号',
          align: 'center'
        },
        {
          prop: 'magnification',
          label: '倍率',
          align: 'center'
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
        }
      ],
      list: [
        {
          genusProject: '行数据',
          tableName: '行数据',
          tableNumber: '行数据',
          magnification: '行数据',
          status: '行数据',
        }
      ]

    }
  },
}

export default config
