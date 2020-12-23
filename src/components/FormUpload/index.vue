<template>
  <div class="upload-box" :class="{'is-look': $attrs.disabled}">
    <div v-for="(item,index) of filterFileList" :key="index" class="file-list flex-lic">
      <el-link target="_blank" @click="getPreviewUrl(item)">
        {{ item.name || item.fileName }}
      </el-link>
      <i v-if="!$attrs.disabled" class="el-icon-error del-icon" @click="removeFile(item)" />
    </div>
    <div v-show="currentFileName" class="file-list flex-lic progress-box">
      <div>
        {{ currentFileName }}
      </div>
      <div>
        <el-progress :percentage="progress" :color="customColors" />
      </div>
    </div>
    <el-checkbox-group v-model="fileList" />
    <el-upload
      ref="upload"
      class="upload"
      :class="$attrs.disabled?'upload-disabled':''"
      v-bind="$attrs"
      :action="beforeUrl(url)"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :show-file-list="showFileList"
      :file-list="filterFileList"
      :headers="uploadHeaders"
      :on-progress="handleProgress"
      :before-remove="beforeRemove"
      :on-exceed="handleExceed"
      :disabled="$attrs.isDisabled"
      v-on="$listeners"
    >
      <slot v-if="$scopedSlots.uploadBtn" name="uploadBtn" />
      <el-button v-else size="small" type="default" icon="el-icon-upload2">点击上传</el-button>

    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import axios from 'axios'

export default {
  name: 'FromUpload',
  components: {},
  directives: {},
  filters: {},
  mixins: [],
  model: {},
  props: {
    showFileList: Boolean,
    url: {
      type: String,
      default: `${process.env.VUE_APP_BASE_API}/file`
    },
    value: {
      type: Array,
      default: () => ([])
    },
    previewUrl: {
      type: String,
      default: `${process.env.VUE_APP_BASE_API}/file/image`
    },
    downUrl: {
      type: String,
      default: `${process.env.VUE_APP_BASE_API}/file/download`
    },
    fileType: String,
    headers: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      fileList: [],
      uploadHeaders: {},
      progress: 0, // 上传进度
      currentFileName: null, // 上传文件名称
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ] // 进度条颜色
    }
  },
  computed: {
    ...mapGetters(['token']),
    filterFileList() {
      return this.fileList.filter(i => i !== undefined)
    }
  },
  watch: {
    fileList: {
      handler(val) {
        this.$emit('input', val)
        this.$emit('change', val)
      },
      deep: true
    },
    value: {
      handler(val) {
        if (!val) return
        const hashMap = []
        const idFiled = this.$attrs.idField || 'id'
        this.fileList = val.filter(i => {
          if (!i[idFiled]) {
            return false
          }

          if (!hashMap.includes(i[idFiled])) {
            hashMap.push(i[idFiled])
            return true
          } else {
            return false
          }
        })
        // this.fileList = val || []
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.uploadHeaders = Object.assign(this.headers, {
      'X-Realm': process.env.VUE_APP_REALMCODE,
      'X-Ldp-Token': getToken()
    })
  },
  methods: {
    beforeUrl(url) {
      if (url && typeof url === 'string') {
        if (url.startsWith('http')) return
        return process.env.VUE_APP_BASE_API + url
      }
    },
    handleRemove(file) {
      const fileId = file.id || file.response.data.id
      const index = this.fileList.findIndex(i => i.id === fileId)
      if (index !== -1) {
        this.$emit('removeFile', this.fileList[index])
        this.fileList.splice(index, 1)
      }
    },
    removeFile(file) {
      this.beforeRemove(file).then(() => {
        this.handleRemove(file)
      })
    },
    getPreviewUrl(file) {
      const fileId = file.id || file.fileId || file.response.data.id
      const suffixIndex = file.name && file.name.lastIndexOf('.')
      const suffix = file.name && file.name.substring(suffixIndex + 1).toUpperCase()
      if (['BMP', 'JPG', 'JPEG', 'PNG', 'GIF'].includes(suffix)) {
        window.open(`${this.previewUrl}/${fileId}`)
      } else {
        const fileId = file.id || file.fileId || file.response.data.id
        const url = `${this.downUrl}`
        axios({
          method: 'get',
          url: url,
          baseURL: process.env.VUE_APP_BASE_API,
          params: {
            fileId
          },
          responseType: 'arraybuffer',
          headers: {
            'X-Realm': process.env.VUE_APP_REALMCODE,
				            'X-Ldp-Token': getToken(),
            filename: 'utf-8'
          }
        }).then(res => {
          const url = window.URL.createObjectURL(new Blob([res.data]))
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          document.body.appendChild(link)
          link.setAttribute('download', file.name || file.fileName)
          link.target = '_blank'
          link.click()
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(url) // 释放掉blob对象
        }).catch(error => {
          console.log(error)
        })
      }
    },
    handlePreview(file) {
      const fileId = file.id || file.response.data.id
      const url = `${this.previewUrl}/${fileId}`
      window.open(url, '_blank')
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 ${this.$attrs.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.progress = 100
        // debugger
        const idField = this.$attrs.idField || 'id'
        const index = this.fileList.findIndex(i => {
          if (i) {
            return i[idField] === response.data || response.data.id || response.data.fileId === i[idField]
          }
          return false
        })
        if (index === -1) {
          this.fileList.push({ id: response.data || response.data.fileId, name: file.name })
        }
      } else {
        this.$message.error(response.msg)
      }
      this.currentFileName = null
      this.progress = 0
      this.$emit('onSuccess', { response, file, fileList })
    },
    handleError() {
      this.$message.error('文件上传失败')
      this.currentFileName = null
      this.progress = 0
    },
    handleProgress(event, file) {
      if (this.progress === 0) {
        this.currentFileName = file.name
      }
      let progress = event.percent.toFixed(2)
      if (progress >= 99.99) {
        progress = 99.99
      }
      this.progress = parseFloat(progress)
    }
  },
}
</script>

<style scoped lang="scss">
    .upload-box {
        display: flex;
        overflow-x: auto;
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
            ::v-deep .el-upload-list {
                display: flex;
                align-items: center;
                .el-upload-list__item {
                    margin-top: 0;
                }
            }
            ::v-deep .el-icon-close-tip {
                display: none !important;
            }
        }
        .upload-disabled {
            ::v-deep .el-upload {
                display: none;
            }
        }
        &::-webkit-scrollbar {
            width: 10px;
            height: 6px;
        }
        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            background: rgba(144,147,153,.3);
            :hover {
                background: rgba(144,147,153,.5)
            }
        }
        &::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            border-radius: 10px;
            background: #EDEDED;
        }
    }
  .is-look {
    margin-left: 15px;
  }
</style>
