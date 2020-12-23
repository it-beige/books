export default {
  data() {
    return {
      formModel: {},
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
      blogArticleList: [
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
      ]
    }
  },
  created() {
    this.$showSuccess(`欢迎你${this.$store.getters.name}`)
  }
}
