import {
  requestUrl
} from '@/api/constant'

const config = {
  data() {
    return {
      tableHead: [
        {
          prop: 'number',
          label: '交房验收编号',
          align: 'center',
          query: {
            type: 'input'
          }
        },
        {
          prop: 'contractNumber',
          label: '合同编号',
          align: 'center',
          query: {
            type: 'input'
          }
        },
        {
          prop: 'grade',
          label: '单元编号',
          align: 'center',
          query: {
            type: 'input'
          }
        },
        {
          prop: 'tenantName',
          label: '租户名称',
          align: 'center',
          query: {
            type: 'input'
          }
        },
        {
          prop: 'sponsor',
          label: '发起人',
          align: 'center'
        },
        {
          prop: 'acceptanceDate',
          label: '交房验收日期',
          align: 'center'
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          query: {
            type: 'select',
            data: [],
            labelKey: 'codeKey',
            valueKey: 'codeValue'
          }
        }
      ],
      dynamicDataBoxData: {
        url: requestUrl.getProjectList,
        tableColumn: [
          {
            prop: 'projectNumber',
            label: '项目编码',
            query: {
              type: 'input'
            }
          },
          {
            prop: 'projectName',
            label: '项目名称',
            query: {
              type: 'input'
            }
          }
        ],
        props: {
          label: 'projectName',
          value: 'id'
        },
        extendParms: { queryFieldItem: 'id,projectNumber,projectName' },
      },
    }
  }
}

export default config
