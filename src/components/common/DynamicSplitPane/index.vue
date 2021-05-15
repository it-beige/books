<!--分割板-->
<template>
  <div ref="mainContainer" :style="{height: mainContainerHeight + 'px'}">
    <split-pane split="vertical" :default-percent="defaultPercent">
      <template slot="paneL">
        <div ref="leftContainer" class="split-container">
          <slot name="left" />
        </div>
      </template>
      <template slot="paneR">
        <div ref="rightContainer" class="split-container">
          <slot name="right" />
        </div>
      </template>
    </split-pane>
  </div>
</template>

<script>
import splitPane from 'vue-splitpane'
import elementResizeDetectorMaker from 'element-resize-detector'

export default {
  name: 'DynamicSplitPane',
  components: {
    splitPane
  },
  props: {
    defaultPercent: {
      type: Number, // 默认分割的大小  15%
      default: 15
    },
    overstep: {
      type: Number, // 超出的高度
      default: 0
    }
  },
  data() {
    return {
      containerHeight: document.documentElement.clientHeight,
      topHeight: 0,
      maxHeight: 0,
      leftContainerHeight: 0,
      rightContainerHeight: 0
    }
  },
  computed: {
    tagsView() {
      return this.$store.state.settings.tagsView
    },
    topHeader() {
      return this.$store.state.settings.topHeader
    },
    mainContainerHeight() {
      if (this.maxHeight <= this.containerHeight) {
        if (this.overstep === 0) {
          return this.containerHeight - this.topHeight
        } else {
          return this.containerHeight - this.overstep
        }
      } else {
        return this.maxHeight
      }
    }
  },
  watch: {
    tagsView() {
      if (this.overstep === 0) {
        this.topHeight = this.$refs.mainContainer.getBoundingClientRect().top
      }
    },
    topHeader() {
      if (this.overstep === 0) {
        this.topHeight = this.$refs.mainContainer.getBoundingClientRect().top
      }
    }
  },
  mounted() {
    const that = this
    const erd = elementResizeDetectorMaker()
    erd.listenTo(that.$refs.mainContainer, element => {
      that.topHeight = element.getBoundingClientRect().top
    })
    erd.listenTo(that.$refs.leftContainer, element => {
      that.leftContainerHeight = element.offsetHeight
      that.$nextTick(() => {
        that.maxHeight = Math.max(
          that.leftContainerHeight,
          that.rightContainerHeight
        )
      })
    })
    erd.listenTo(that.$refs.rightContainer, element => {
      that.rightContainerHeight = element.offsetHeight
      that.$nextTick(() => {
        that.maxHeight = Math.max(
          that.leftContainerHeight,
          that.rightContainerHeight
        )
      })
    })
  }
}
</script>

<style scoped lang="scss">
.split-container {
  overflow-x: hidden
}
</style>
