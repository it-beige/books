<template>
  <el-card class="folded-panel-card">
    <slot name="header" v-if="$slots.header" />
    <div v-if="header" class="header-slot-wrapper" slot="header">
      {{header}}
      <div class="right-tool-wrap">
        <slot name="toolbar" v-if="$slots.toolbar" />
        <div class="toolbar-btn-wrap" v-if="isAddShow">
          <div class="toolbar-btn">
            <svg-icon icon-class="add" style="width: 100%; height: 100%" @click="licenseTableInsertRow" >
            </svg-icon>
          </div>
          <div class="toolbar-btn">
            <svg-icon icon-class="remove" style="width: 100%; height: 100%" @click="licenseTableRemoveRow" >
            </svg-icon>
          </div>
        </div>
      </div>
    </div>
    <slot />
  </el-card>
</template>

<script>
export default {
  name: 'CardPanel',
  components: {},
  directives: {},
  filters: {},
  mixins: [],
  props: {
    header: String,
    isAddShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    licenseTableInsertRow() {
      this.$emit('licenseTableInsertRow','')
    },
    licenseTableRemoveRow() {
      this.$emit('licenseTableRemoveRow','')
    }
  }
}
</script>

<style scoped lang="scss">
  .folded-panel-card {
    margin-top: 10px;
    ::v-deep.el-card__header {
      border-bottom: 2px solid #eee!important;
      margin: 0!important;
      padding: 18px 20px!important;
    }
    .header-slot-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .right-tool-wrap {
        float: right;
      }
      .toolbar-btn-wrap {
        display: inline-flex;
        align-items: center;
      }
      .toolbar-btn {
        cursor: pointer;
        width: 25px;
        height: 25px;
      }
      .toolbar-btn + .toolbar-btn {
        margin-left: 10px;
      }
    }
  }
</style>
