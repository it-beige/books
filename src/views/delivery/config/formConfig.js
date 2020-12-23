import {
  requestUrl,
} from '@/api/constant'
const config = {
  data() {
    return {
      // 基础信息
      baseFormConfig: {
        formItemList: [
          {
            label: '交房验收编号',
            key: 'billNumber',
            type: 'input',
            disabled: true,
            span: 8,
          },
          {
            label: '合同编号',
            key: 'contractNumber',
            type: 'databox',
            span: 8,
            placeholder: '请选择合同编号',
            value: '123123',
            trigger: {
              type: 'input',
              btnType: 'primary',
              btnSize: 'mini',
              title: '选择合同'
            },
            extendParms: { queryFieldItem: 'id,number,name' },
            multiple: false,
            props: {
              label: 'name',
              value: 'id'
            },
            url: '/bs-person/getList',
            tableColumn: [
              {
                property: 'code',
                label: '编码',
                align: 'center',
                query: {
                  type: 'input'
                }
              },
              {
                property: 'name',
                label: '名称',
                align: 'center',
                query: {
                  type: 'input'
                }
              }
            ],
            rules: [
              {
                required: true,
                message: '合同必填',
                trigger: 'change'
              }
            ]
          },
          {
            label: '交房验收日期',
            key: 'acceptanceDate',
            type: 'date',
            span: 8,
            placeholder: '年/月/日',
            viewFormat: 'yyyy 年 MM 月 dd 日',
            rules: {
              required: true,
              message: '验收日期必填',
              trigger: 'blur'
            }
          },
          {
            label: '项目名称',
            key: 'projectName',
            type: 'input',
            disabled: true,
            span: 8,
            placeholder: '请输入项目名称',
          },
          {
            label: '租赁单元',
            key: 'rentalUnit',
            type: 'input',
            disabled: true,
            span: 8,
            placeholder: '请输入租赁单元',
          },
          {
            label: '租户名称',
            key: 'tenantName',
            disabled: true,
            type: 'input',
            span: 8,
            placeholder: '请输入租户名称',
          },
          {
            label: '租户联系人',
            key: 'tenantContact',
            type: 'input',
            disabled: true,
            span: 8,
            placeholder: '请输入租户联系人',
          },
          {
            label: '联系电话',
            key: 'contactNumber',
            type: 'input',
            disabled: true,
            span: 8,
            placeholder: '请输入联系电话',
          },
          {
            label: '状态',
            key: 'status',
            type: 'select',
            disabled: true,
            span: 8,
          },

        ]
      },

      // 单元
      unitTable: {
        tableHead: [
          {
            label: '单元编号',
            prop: 'taxCategory',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
        ],
        list: [
          {
            taxCategory: '1',
          }
        ]
      },

      // 附件
      attachmentTable: {
        tableHead: [
          {
            label: '附件类型',
            prop: 'documentType',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '附件操作',
            prop: 'attachments',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '上传日期',
            prop: 'uploadDate',
            align: 'center',
            minWidth: '110',
          }
        ],
        databoxOptions: {
          props: { label: 'name', value: 'id' },
          hostUrl: `${requestUrl}/getUserInfo`,
          tableColumn: [
            {
              property: 'account',
              label: '子账号',
              query: {
                type: 'input'
              }
            },
            {
              property: 'name',
              label: '子账号名称'
            }
          ]
        },
        list: []
      },

      // 银行信息
      bankTable: {
        tableHead: [
          {
            label: '开户名称',
            prop: 'documentType',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '开户行',
            prop: 'bankNumber',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '银行账号',
            prop: 'bankCount',
            align: 'center',
            minWidth: '110',
            editRender: { type: 'default', name: 'ElInput' }

          },
          {
            label: '是否默认',
            prop: 'isDefault',
            align: 'center',
            minWidth: '110',
            editRender: { type: 'default',
              name: 'ElSelect',
              options: [
                { value: 1, label: '是' },
                { value: 0, label: '否' }
              ]
            }
          }
        ],
        databoxOptions: {
          props: { label: 'name', value: 'id' },
          hostUrl: `${requestUrl}/getUserInfo`,
          tableColumn: [
            {
              property: 'account',
              label: '子账号',
              query: {
                type: 'input'
              }
            },
            {
              property: 'name',
              label: '子账号名称'
            }
          ]
        },
        list: []
      },

      // 默认设施
      facilitiesTable: {
        tableHead: [
          {
            label: '设施',
            prop: 'linkPerson',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '状态',
            prop: 'status',
            align: 'center',
            editRender: {
              type: 'default',
              name: 'ElSelect',
              options: [
                { value: '正常', label: '正常' },
                { value: '异常', label: '异常' }
              ]
            }
          },
          {
            label: '验收确认及不确定情况说明',
            prop: 'linkPerson2',
            align: 'center',
            editRender: {
              type: 'default',
              name: 'ElInput',
              props: {
                type: 'textarea',
                autosize: { minRows: 1, maxRows: 4 }
              }
            }
          }

        ],
        list: []
      },

      // 能耗检查
      energyTable: {
        tableHead: [
          {
            label: '类型',
            prop: 'linkPerson1',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '表名',
            prop: 'linkPerson2',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '设备号',
            prop: 'linkPerson3',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '抄表数',
            prop: 'linkPerson4',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          },
          {
            label: '抄表日期',
            prop: 'linkPerson5',
            align: 'center',
            editRender: { type: 'default', name: 'ElInput' }
          }
        ],
        list: []
      },

      unitTableValidRules: {
        floorNumber: [{ required: true, message: '楼层号不能为空', trigger: 'blur' }]
      },
      attachmentTableValidRules: {
        bankCount: [
          { required: true, message: '银行账号不能为空', trigger: 'blur' }
        ],
        // documentType: [{ required: true, message: '开户名称不能为空', trigger: 'blur' }],
        bankNumber: [{ required: true, message: '开户行不能为空', trigger: 'blur' }],
        isDefault: [{ required: true, message: '楼层号不能为空', trigger: 'blur' }]
      },
      facilitiesTableValidRules: {
        floorNumber: [{ required: true, message: '楼层号不能为空', trigger: 'blur' }]
      },
      energyTableValidRules: {
        floorNumber: [{ required: true, message: '楼层号不能为空', trigger: 'blur' }]
      },
    }
  },
  methods: {
    configHandle() {
      return {
        trigger: 'click',
        mode: 'row',
        autoClearActive: false,
        // 指定证照附件允许编辑
        /* activeMethod: ({ column }) => {
          if (column.property === 'attachment') {
            return false
          }
          return true
        } */
      }
    },
  }
}

export default config
