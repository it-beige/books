<template>
  <div class="img-upload">
    <el-upload
      class="upload-wrapper"
      :action="fileUrl"
      v-bind="$attrs"
      :headers="uploadHeaders"
      :show-file-list="showFileList"
      :file-list="fileList"
      :list-type="listType"
      :before-upload="beforeFileUpload"
      :on-success="handleSuccess"
      v-on="$listeners"
    >
      <slot v-if="$scopedSlots.uploadBtn" name="uploadBtn" />
      <el-button v-else size="small" type="primary">点击上传</el-button>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'

export default {
  name: 'ImgUpload',
  components: {

  },
  props: {
    headers: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      default: `${process.env.VUE_APP_PROXY_SERVER}/file`
    },
    fileList: {
      type: Array,
      default: () => []
    },
    listType: {
      type: String,
      default: 'picture'
    },
    showFileList: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 100
    },
  },
  data() {
    return {
      uploadHeaders: {} // 请求头
    }
  },
  data() {
    return {
      fileSize: this.size, // 上传文件的大小限制
      fileUrl: '', //　上传url
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  created() {
    this.uploadHeaders = Object.assign(this.headers, {
      'X-Realm': process.env.VUE_APP_REALMCODE,
      'X-Ldp-Token': getToken()
    })
    if (this.url && typeof this.url === 'string') {
      if (this.url.startsWith('http')) return
      this.fileUrl = process.env.VUE_APP_BASE_API + this.url
    }
  },
  methods: {
    beforeFileUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < this.fileSize
      console.log(isLt2M)
      const isLtType = file.name
      const pos = isLtType.lastIndexOf('.')
      const lastName = isLtType.substring(pos, isLtType.length)
      const type = ['.doc', '.docx', '.txt', '.pdf', '.png', '.gif', '.jpg', '.jpeg', '.tiff', '.html', '.rtf', '.xls', '.xlsx', '.pptx', '.ppt']
      const imgType = ['.png', '.gif', '.jpg', '.jpeg']
      const result1 = imgType.some(function(item) {
        return item === lastName.toLowerCase()
      })
      if (!result1) {
        this.$message.error('请上传正确的图片类型')
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 ' + this.fileSize + 'MB!')
      }
      return result1 && isLt2M
    },

    async handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success('上传成功')
      } else {
        this.$message.error('上传失败')
      }

      this.$emit('onSuccess', { response, file, fileList })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
