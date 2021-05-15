import { initData } from '@/api/data'
import { requestUrl } from '@/api/constant'

export default {
  data() {
    return {
      dictMap: {}
    }
  },
  methods: {

    // 加载多个数据字典，如何调用如下：
    // 在vue中使用加载出来的字典：
    /**
     * 改为并行请求，然后重新转载
     */
    async dataDictInit(dictCodeArray = []) {
      return new Promise((resolve) => {
        const promiseList = []
        dictCodeArray.forEach(code => {
          promiseList.push(initData(requestUrl.dictSelectUrl, { typeCode: code }))
        })
        Promise.all(promiseList).then((data = []) => {
          data.forEach((code, index) => {
            if (code.code === 200) {
              this.$set(this.dictMap, dictCodeArray[index], code.data)
            }
          })
          resolve(this.dictMap)
        })
      })
    },

    /**
     * 表格数据格式
     * @param cellVal 单元格的值
     * @param dictTypeCode 字典编码
     */
    tableCellFormatter(cellVal, dictTypeCode) {
      const options = this.dictMap[dictTypeCode]
      if (options && options.length) {
        /* eslint-disable */
        const option = options.find(i => i.codeValue == cellVal)
        if (option) {
          return option.codeKey
        }
      }
      return ''
    }
  }
}
