<template>
  <div class="app-container delivery-form">
    <el-card class="box-card">
      <div slot="header" class="header-container">
        <label>交房验收</label>
        <div class="btn-wrapper">
          <el-button
            size="mini"
            type="primary"
            @click="downloadHandle"
          >
            下载
          </el-button>
          <el-button
            size="mini"
            type="primary"
            @click="previewHandle"
          >
            预览
          </el-button>
          <el-button
            size="mini"
            type="primary"
            @click="approvalHandle"
          >
            审批流
          </el-button>
          <el-button
            v-show="disabled"
            size="mini"
            type="primary"
            @click="editFormHandle(false)"
          >
            修改
          </el-button>
          <el-button v-show="!disabled" type="primary" size="mini" @click="saveFloorHandle">
            保存
          </el-button>
          <el-button type="primary" size="mini" @click="cancelFormHandle(false)">
            关闭
          </el-button>
        </div>
      </div>
      <dynamic-form
        ref="pageForm"
        v-model="formModel"
        label-width="130px"
        :form-config="baseFormConfig"
        :show-btn="false"
        :disabled="disabled"
      />
    </el-card>

    <card-panel header="单元">
      <div class="table-wrapper">
        <edit-data-table
          ref="unitTableRef"
          border
          stripe
          :head="unitTable.tableHead"
          :data.sync="unitTable.list"
          :editable="false"
          :show-number="true"
          :show-selection="true"
          :edit-rules="unitTableValidRules"
          :tool-bar="{ hidden: false }"
          height=""
        >
          <!-- 自定义序号 -->
          <template #indexHeader>
            序号
          </template>

          <!-- 自定义序号 -->
          <template #toolbar>
            <el-button type="text" @click="checkHandle">检查</el-button>
          </template>

        </edit-data-table>
      </div>

    </card-panel>

    <card-panel header="附件">
      <div v-show="!disabled" slot="toolbar" class="handle-wrapper">
        <div class="addBtn">
          <svg-icon
            icon-class="add"
            style="width: 100%; height: 100%"
            @click="insertRow"
          />
        </div>
        <div class="removeBtn">
          <svg-icon
            icon-class="remove"
            style="width: 100%; height: 100%"
            @click="removeRow"
          />
        </div>
      </div>
      <edit-data-table
        ref="attachmentTableRef"
        border
        stripe
        :head="attachmentTable.tableHead"
        :data.sync="attachmentTable.list"
        :editable="!disabled"
        :show-number="true"
        :show-selection="true"
        :edit-rules="attachmentTableValidRules"
        :tool-bar="{ hidden: true }"
        :config="configHandle()"
        height=""
        @selection-change="selectionChangeHandle"
      >
        <!-- 自定义序号 -->
        <template #indexHeader>
          序号
        </template>

        <template #uploadDate="{ row }">
          <div>{{ row.uploadDate | formatTime }}</div>
        </template>

        <template #attachmentsEdit="{ row }">
          <div class="attachmend">
            <FormUpload
              ref="formUpload"
              name="uploadFile"
              id-field="fileId"
              :value="row.attachments"
              :limit="5"
              :url="url"
              :down-url="downUrl"
              @onSuccess="handleSuccess($event, row)"
              @removeFile="removeFileHandle"
            >
              <template slot="uploadBtn">
                <el-button type="text" size="mini">
                  上传
                </el-button>
              </template>
            </FormUpload>
          </div>
        </template>
        <template #attachments="{ row }">
          <div class="attachmend">
            <FormUpload
              id-field="fileId"
              :value="row.attachments"
              :disabled="true"
              :down-url="downUrl"
            />
          </div>
        </template>

        <template #documentTypeEdit="{ row }">
          <!-- F7 -->
          <dynamic-data-box
            ref="attachmentDatabox"
            :props="attachmentTable.databoxOptions.props"
            :host-url="attachmentTable.databoxOptions.hostUrl"
            :value="attachmentDataboxList"
            :multiple="false"
            :table-column="attachmentTable.databoxOptions.tableColumn"
            v-on="$listeners"
            @confirm="(val) => {changeConfirm(val, row) }"
          />
        </template>
        <template #documentType="{ row }">
          {{ row.documentType }}
        </template>
      </edit-data-table>
    </card-panel>

    <!-- -检查详情 -->
    <DragDialog
      :show.sync="dialog"
      title="单元检查"
      width="1200px"
      enable-drag
      @close="cancelDialog"
    >
      <!-- 动态表格区域 -->
      <TitleDivision title-name="默认设施" />
      <edit-data-table
        ref="facilitiesTableRef"
        border
        stripe
        :head="facilitiesTable.tableHead"
        :data.sync="facilitiesTable.list"
        :editable="!disabled"
        :show-number="true"
        :show-selection="true"
        :edit-rules="facilitiesTableValidRules"
        :tool-bar="{ hidden: true }"
        height=""
      >
        <!-- 自定义序号 -->
        <template #indexHeader>
          序号
        </template>
      </edit-data-table>

      <TitleDivision title-name="能耗检查" />
      <edit-data-table
        ref="energyTableRef"
        border
        stripe
        :head="energyTable.tableHead"
        :data.sync="energyTable.list"
        :editable="!disabled"
        :show-number="true"
        :show-selection="true"
        :edit-rules="energyTableValidRules"
        :tool-bar="{ hidden: true }"
        height=""
      >
        <!-- 自定义序号 -->
        <template #indexHeader>
          序号
        </template>
      </edit-data-table>
    </DragDialog>
  </div>
</template>

<script type="text/ecmascript-6">
import '@/components/DynamicForm'
import FormUpload from '@/components/FormUpload'
import DataTableMixin from '@/mixins/DataTableMixin'
import TitleDivision from '@/components/TitleDivision'
import DragDialog from '@/components/DragDialog'
import configMixin from './config/formConfig'

import {
  requestUrl,
} from '@/api/constant'
import {
  addIntermediary,
  getIntermediary,
  putIntermediary
} from '@/api/tenancy/customer-relationship/intermediaryAPI'
import {
  delFile
} from '@/api/file'
export default {
  components: {
    TitleDivision,
    FormUpload,
    DragDialog
  },
  mixins: [DataTableMixin, configMixin],
  props: {},
  data() {
    return {
      dialog: false,
      disabled: false, // 是否是编辑的表单
      isEdit: false, // 当前是否是编辑操作
      url: requestUrl.uploadAdd, // 上传Url
      downUrl: requestUrl.fileDown, // 下载Url
      formModel: {},
      attachmentTableSelecData: [], // 联系人表格选中的行数据
      attachmentDataboxList: [], // 附件F7

    }
  },
  created() {
    // 查看详情
    this.disabled = this.$route.query.id && true
    if (this.disabled) {
      this.title = '中介详情'
      this.getIntermediaryDetails()
    } else {
      this.formModel.acceptanceDate = +new Date()
    }
  },
  methods: {
    // 检查操作
    checkHandle() {
      this.dialog = true
    },
    // 关闭弹出框
    cancelDialog() {
      this.dialog = false
    },

    // 获取单据详情
    async getIntermediaryDetails() {
      const response = await getIntermediary(this.$route.query.id)
      if (response.code === 200) {
        this.formModel.baseForm = response.data || {}
        this.unitTable.list = response.data.intermediaryLicenseInformations || []
        this.attachmentTable.list = response.data.intermediaryBanks || []
        this.concatTable.list = response.data.intermediaryLinkPersons || []
      }
    },

    // 显示逻辑
    isShowHandle(isDisabled) {
      this.disabled = isDisabled
    },

    /**
     * @description:
     * @param {*} file 当前上传的文件
     * @param {*} fileList 文件列表
     * @param {*} row 当前上传的表格行
     * @return {*}
     * @Date Changed:
     */
    handleSuccess({ response, file, fileList }, row) {
      const attachments = {
        fileId: response.data,
        fileUrl: response.data,
        uploadDate: response.currentTime,
        fileName: file.name,
        documentType: row.documentType,
      }
      if (row && Array.isArray(row.attachments)) {
        row.attachments.push(attachments)
      }
      this.$set(row, 'uploadDate', response.currentTime)
      this.$set(row, 'fileName', file.name)
    },

    /**
     * @description: 调用接口移除文件
     * @param {Object} file
     * @return {*}
     * @Date Changed:
     */
    async removeFileHandle(file) {
      if (file && file.id || file.fileId) {
        const reponse = await delFile(file.id)
        if (reponse.code === 200) {
          this.$message.success('移除成功!')
        }
      }
    },

    /**
     * @description: 下载文件
     * @param {Object} file
     * @return {*}
     * @Date Changed:
     */
    downFile(file) {
      if (file) {
        // 调用组件内写好的下载方法
        this.$refs.formUpload.getPreviewUrl(file)
      }
    },

    /**
     * @info 编辑表单
     * @isDisabled 查看Or编辑
     */
    editFormHandle(isDisabled) {
      this.isEdit = true
      this.isShowHandle(isDisabled)
    },

    /**
     * @description: 增加行
     */
    insertRow() {
      this.$refs.attachmentTableRef.$refs.elTable.validate()
        .then(() => {
          return this.$refs.attachmentTableRef.$refs.elTable.insert()
        })
        .then(({ row }) => {
          // 设置附件为数组类型
          this.$set(row, 'attachments', [])
          // 只有附件信息是单元格编辑
          this.$refs.attachmentTableRef.$refs.elTable
            .setActiveCell(row, 'attachments')
        })
        .catch(() => {})
    },

    /**
     * @description: 删除行
     */
    removeRow() {
      if (this.attachmentTableSelecData.length < 1) {
        return this.$message.warning('请勾选要删除的行！')
      }

      this.$confirm('你确定要删除勾选行吗?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )
        .then(async() => {
          this.$refs.attachmentTableRef.$refs.elTable.removeSelecteds()
        })
    },

    // 保存操作
    saveFloorHandle() {
      this.$refs.pageForm
        .validate()
        .then(() => {
          const form = {
            ...this.formModel,
            intermediaryLicenseInformations: this.unitTable.list,
            intermediaryBanks: this.attachmentTable.list,
            intermediaryLinkPersons: this.bankTable.list
          }
          console.log(form)
          this.$confirm('已保存，是否对当前操作进行提交?', '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }
          )
            .then(async() => {
              if (this.isEdit) { // 修改中介单据
                const response = await putIntermediary(form)
                if (response.code === 200) {
                  this.$message.success('修改成功')
                  this.cancelFormHandle(true)
                }
              } else { // 增加中介单据
                const response = await addIntermediary(form)
                if (response.code === 200) {
                  this.$message.success('保存成功')
                  this.cancelFormHandle(true)
                }
              }
            })
          console.log(form)
        })
        .catch(() => {
          this.$message.error('请完善表单必填项目再进行提交！')
          console.error(this.formModel)
          return
        })
    },

    /**
     * @description: 选中的当前行
     */
    selectionChangeHandle(data) {
      this.attachmentTableSelecData = data
    },

    /**
     * @description: 关闭表单
     * @param {Boolean} flag: true -> 新增成功后直接关闭表单 flase -> 提示用户
     * @return {*}
     */
    cancelFormHandle(flag = false) {
      if (flag) {
        this.$router.back(-1)
        this.$store.dispatch('tagsView/delView', this.$route)
        return
      }
      this.$confirm('你确定要关闭吗?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )
        .then(() => {
          this.$router.back(-1)
          this.$store.dispatch('tagsView/delView', this.$route)
        })
        .catch(() => {})
    },

    // 下载操作
    downloadHandle() {},
    // 预览操作
    previewHandle() {},
    // 审批流操作
    approvalHandle() {}

  }
}
</script>
<style  scoped lang="scss">
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";
  .delivery-form ::v-deep  {
    is-disabled {
      background-color: #F5F7FA;
      border-radius: 5px;
    }

    .upload-box {
      flex-direction: column;
    }

    .is-look .is-disabled{
      margin-left: 10px;
      border: 1px solid #dfe4ed;
    }
    .el-card__header {
      border-bottom: 2px solid $blue;
      padding: 18px 0;
      margin: 0 20px;
    }
  }

  .delivery-form {
    .attachmend {
      display: flex;
      justify-content: center;
      .img-container {
        display: flex;
        align-items: center;
      }
      .img-wrapper {
        position: relative;
        cursor: pointer;
        margin-right: 15px;
      }
      .remove-img {
        position: absolute;
        z-index: 2;
        right: -10px;
        top: -6px;
      }
      .el-image {
        width: 50px;
        height: 50px;
      }
      .btn-warpper {
        margin-left: 5px;
        display: flex;
        align-items: center;
        .preview-btn {
          margin-left: 10px;
        }
      }
    }
    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .handle-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
      .addBtn,
      .removeBtn {
        cursor: pointer;
        width: 25px;
        height: 25px;
      }
      .addBtn {
        margin-right: 10px;
      }
    }
  }

  .form-item{
    display: flex;
    align-items: right;
    justify-content: space-between;
  }
</style>
