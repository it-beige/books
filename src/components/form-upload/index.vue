<template>
    <div class="upload-box" :class="{'is-look': $attrs.disabled}">
      <div class="file-list flex-lic" v-for="(item,index) of filterFileList" :key="index">
        <el-link @click="getPreviewUrl(item)" target="_blank">
          {{item.name}}
        </el-link>
        <i class="el-icon-error del-icon" @click="removeFile(item)" v-if="!$attrs.disabled"></i>
      </div>
      <div class="file-list flex-lic progress-box" v-show="currentFileName">
        <div>
            {{currentFileName}}
        </div>
        <div>
            <el-progress :percentage="progress" :color="customColors"></el-progress>
        </div>
      </div>
      <el-checkbox-group v-model="fileList"></el-checkbox-group>
    <el-upload
      class="upload"
      name="file"
      :action="url"
      :headers="uploadHeaders"
      :on-progress="handleProgress"
      :before-upload="beforeFileUpload"
      :on-success="handleSuccess"
      :show-file-list="showFileList"
      :file-list="filterFileList"
      style="display: inline"
      >
      <!--v-if="isRecruit !== '0'"-->
      <el-button size="small" type="default" icon="el-icon-upload2" v-if="!$attrs.disabled">点击上传</el-button>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
/* import axios from "axios" */
import { FileUtil } from "@/utils/common.js";
import { getToken } from "@/utils/auth";
// import uuidv1 from "uuid/v1";
import { LoadingUtil } from "@/utils/LoadingUtil";

export default {
  name: "FromUpload",
  components: {},
  directives: {},
  filters: {},
  mixins: [],
  model: {},
  props: {
    showFileList: Boolean,
    url: {
      type: String,
      default: `${process.env.VUE_APP_BASE_API_COST}/file/upload`
    },
    value: {
      type: Array,
      default: () => []
    },
    previewUrl: {
      type: String,
      default: `${process.env.VUE_APP_BASE_API_COST}/file/image/get`
    },
    downUrl: {
      type: String,
      default: `${process.env.VUE_APP_BASE_API_COST}/file/get`
    },
    fileType: String,
    headers: {
      type: Object,
      default: () => ({})
    },
    attachmentData: {
      type: Array
    },
    size: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      fileList: [],
      uploadHeaders: {},
      progress: 0, // 上传进度
      currentFileName: null, // 上传文件名称
      fileSize: this.size, // 上传文件的大小限制
      customColors: [
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#1989fa", percentage: 80 },
        { color: "#6f7ad3", percentage: 100 }
      ] // 进度条颜色
    };
  },
  computed: {
    ...mapGetters(["token"]),
    filterFileList() {
      console.log(this.fileList);
      return this.fileList.filter(i => i !== undefined);
    }
  },
  watch: {
    fileList: {
      handler(val) {
        this.$emit("input", val);
        this.$emit("change", val);
      },
      deep: true
    },
    value: {
      handler(val) {
        this.fileList = val || [];
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.uploadHeaders = Object.assign(this.headers, {
      Authorization: `Bearer ${this.token}`
    });
  },
  methods: {
    handleProgress() {
      LoadingUtil.showLoading();
    },
    beforeFileUpload(file) {
      console.log(file)
      console.log(file.size / 1024 / 1024)
      console.log(this.fileSize)
      const isLt2M = file.size / 1024 / 1024 < this.fileSize
      console.log(isLt2M)
      const isLtType = file.name
      const pos = isLtType.lastIndexOf('.')
      const lastName = isLtType.substring(pos, isLtType.length)
      const type = ['.doc','.docx','.txt','.pdf','.png','.gif','.jpg','.jpeg','.tiff','.html','.rtf','.xls', '.xlsx', '.pptx', '.ppt'];
      const result1 = type.some(function(item) {
          console.log(item)
          return item === lastName.toLowerCase();
      });
      // this.result = result1
      console.log(lastName)
      console.log(result1)
      console.log(isLt2M)

      if (!result1) {
          this.$message.error('请上传正确的文件类型')
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 ' + this.fileSize + 'MB!')
      }
      return result1 && isLt2M
    },
    handleRemove(file) {
      const fileId = file.id || file.uid;
      const isId = file.id ? 'id' : 'uid';
      const index = this.fileList.findIndex(i => i[isId] === fileId);
      if (index !== -1) {
        this.fileList.splice(index, 1);
      }
    },
    removeFile(file) { // 删除
      this.beforeRemove(file).then(() => {
        this.handleRemove(file);
      });
    },
    getPreviewUrl(file) { // 下载
      // => 之间拷贝过来的逻辑
      const fileId = file.id || file.response && file.response.data.id;
      const suffixIndex = file.name.lastIndexOf(".");
      const suffix = file.name.substring(suffixIndex + 1).toUpperCase();

      if (["BMP", "JPG", "JPEG", "PNG", "GIF"].includes(suffix)) {
        window.open(`${this.previewUrl}/${fileId}`);
      } else {
        var url = process.env.VUE_APP_BASE_DOWN_COST + '/' + file.fileUrl;
        window.open(url);
      }
    },
    handlePreview(file) {
      const fileId = file.id || file.response.data.id;
      const url = `${this.previewUrl}/${fileId}`;
      window.open(url, "_blank");
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 ${this.$attrs.limit} 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    handleSuccess(response, file, fileList) {
      // ----------------> 之前的上传方式
      if (response.code === '2000') {
        // 组件内部
        const fileData = {};
        fileData.name = file.name;
        fileData.fileUrl = "/api/inner/platform/file/get?token=" + getToken() + "&key=" + encodeURIComponent(response.data);
        console.log(fileData.fileUrl);
        fileData.uploadDate = FileUtil.getFileById(response.data).uploadTime;
        fileData.outerId = this.outerId;
        // fileData.index = uuidv1();
        fileData.isSignatures = "0";
        this.fileList.push(fileData);
        LoadingUtil.hideLoading();
        this.$message.success("上传成功");
        // this.$emit('uploadSuccess', this.attachmentData)
      } else {
        this.$message.success(response.message);
      }
      this.currentFileName = null;
      this.progress = 0;
    },
    handleError() {
      this.$message.error("文件上传失败");
      this.currentFileName = null;
      this.progress = 0;
    },
    /* handleProgress(event, file) {
      if (this.progress === 0) {
        this.currentFileName = file.name;
      }
      let progress = event.percent.toFixed(2);
      if (progress >= 99.99) {
        progress = 99.99;
      }
      this.progress = parseFloat(progress);
    } */
  }
};
</script>

<style scoped lang="scss">
.upload-box {
  display: flex;
  overflow-x: auto;
  flex-direction: column;
  .file-list {
    margin-right: 20px;
    white-space: nowrap;
    i {
      vertical-align: middle;
    }
    .del-icon {
      color: red;
      cursor: pointer;
    }
  }
  .progress-box {
    min-width: 160px;
    overflow: hidden;
    div {
      width: 99%;
      text-align: left;
    }
  }
  .upload {
    display: flex;
    ::v-deep  .el-upload-list {
      display: flex;
      align-items: center;
      .el-upload-list__item {
        margin-top: 0;
      }
    }
    ::v-deep  .el-icon-close-tip {
      display: none !important;
    }
  }
  .upload-disabled {
    ::v-deep  .el-upload {
      display: none;
    }
  }
  &::-webkit-scrollbar {
    width: 10px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(144, 147, 153, 0.3);
    :hover {
      background: rgba(144, 147, 153, 0.5);
    }
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
  }
}
.is-look {
  margin-left: 15px;
}
</style>
