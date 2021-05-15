import { MOCK_GATEWAY } from '@/api/gateway'

/** *******常量数据***********/
const requestUrl = {
  /**
   * 字典类型全部调用这个，加上下面参数即可，
   * 页面需要导入：import {requestUrl, dictTypeCode} from "@/api/constant";
   * 参数固定例子：
   * optionsUrl: requestUrl.dictSelectUrl,
   params: {
                typeCode: dictTypeCode.bussType
              },
   */
  // 下拉框列表信息
  dictSelectUrl: '/mcs-service/dic/get/list',

  // 项目列表接口
  getProjectList: `${MOCK_GATEWAY}/projectList`,
  getTestAExportData: `${MOCK_GATEWAY}/getTestAExportData`,
  getAllTestAExportData: `${MOCK_GATEWAY}/getAllTestAExportData`,

}

const dictTypeCode = {

}

export {
  requestUrl,
  dictTypeCode
}

