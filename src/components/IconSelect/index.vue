<template>
  <div class="app-wrapper">
    <div v-popover:popover class="visible-wrapper">
      <i class="visible-icon el-icon-arrow-down" />
      <span v-if="selectIcon === '' || selectIcon === undefined" class="placeholder">{{ placeholder }}</span>
      <span v-else>{{ selectIcon }} <svg-icon class="icon" :icon-class="selectIcon" /></span>
    </div>
    <el-popover
      ref="popover"
      v-model="visible"
      placement="top"
      width="800"
      trigger="click"
    >
      <el-row>
        <div v-for="(item, index) in iconList" :key="index" class="icon-wrapper">
          <el-col :span="2">
            <svg-icon class="icon" :icon-class="item" @click="selectClick(item)" />
          </el-col>
        </div>
      </el-row>
    </el-popover>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'IconSelect',
  components: {},
  props: {
    placeholder: {
      type: String,
      default: '请选择图标'
    },
    value: {
      type: [Array, Object, String, Number]
    }
  },
  data() {
    return {
      selectIcon: '',
      isShow: false,
      iconList: [],
      visible: false
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        // this.fileList = val || []
        this.selectIcon = val
      },
      deep: true,
      immediate: true
    },
    selectIcon: {
      handler(val) {
        this.$emit('input', val)
        this.$emit('change', val)
      },
      deep: true
    }
  },
  created() {},
  mounted() {
    new Promise((resolve, reject) => {
      this.getFiles()
      if (this.iconList.length > 0) {
        resolve()
      }
    }).then(() => {
      // console.log(this.files)
      // this.preload(this.files)
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    getFiles() {
      const files = require.context('@/icons/svg', false, /.(png|jpg|jpeg|gif|bmp|webp|svg)$/).keys()
      for (const item of files) {
        this.iconList.push(item.substring(2).replace('.svg', ''))
      }
    },
    selectClick(val) {
      console.log(val)
      this.visible = false
      this.selectIcon = val
      // this.$emit('input', this.checkedValue)
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  height: 40px;
  width: 100%;
  .visible-wrapper {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;
    .visible-icon {
      position: absolute;
      right: 10px;
      height: 40px;
      line-height: 40px;
      color: #c0c4cf;
    }
    .placeholder {
      color: #c0c4cf;
    }
  }
}
.icon-wrapper {
  .icon {
    font-size: 20px;
    margin: 5px 0;
  }
}
</style>
