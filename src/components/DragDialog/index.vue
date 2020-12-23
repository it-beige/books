<!-- 拖拽 Dialog -->
<template>
  <el-dialog
    v-el-DragDialog
    :enableDrag="enableDrag"
    class="popup"
    :visible.sync="dialogShow"
    :width="width"
    :height="height"
    :show-close="false"
    :append-to-body="appendToBody"
    v-el-drag-dialog
    @close="handleClose"
    @open="handleOpen"
  >
    <div class="popup-header" :class="{' has-title':title}" slot="title">
      <template v-if="!$scopedSlots.title" >
        <div class="popup-title">{{title}}</div>
        <div class="popup-close-btn" @click="close">
          <i class="el-icon-close"></i>
        </div>
      </template>

      <div v-else class="popup-header">
        <slot name="title"></slot>
      </div>
    </div>
  
    <div class="popup-box">
      <div class="slot-box" :style="{'max-height':maxHeight+'px','min-height': minHeight+'px'}">
        <slot></slot>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from "@/directive/el-drag-dialog";

export default {
  name: "DragDialog",
  directives: {
    elDragDialog
  },
  props: {
    show: {
      type: Boolean, // 是否弹出窗口
      required: true
    },
    enableDrag: {
      type: Boolean, // 是否开启拖拽功能
      default: false
    },
    title: {
      type: String // 弹出的标题
    },
    width: {
      type: String, // 弹出的宽度
      default: "80%"
    },
    appendToBody: {
      type: Boolean, // 是否加在body上  多层弹出嵌套勾选
      default: false
    },
    height: String,
    maxHeight: {
      // 弹窗框最大高度
      type: Number,
      default: document.documentElement.clientHeight - 140 // 导航栏-Dialog标题栏-底部(50-40-50)
    },
    minHeight: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dialogShow: this.show
    };
  },
  watch: {
    show(val) {
      this.dialogShow = val;
    },
    dialogShow(val) {
      this.$emit("update:show", val);
    }
  },
  methods: {
    handleClose() {
      this.close();
      this.$emit("close");
    },
    handleOpen() {
      this.$emit("handleOpen");
    },
    close() {
      this.dialogShow = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.popup {
  overflow: hidden;
  & ::v-deep .el-dialog {
    width: 100%;
    margin: 0 auto;
    overflow: auto;
  }
  & ::v-deep .el-dialog__body {
    padding: 0;
  }
  & ::v-deep .el-dialog__header {
    padding: 0;
  }
  & ::v-deep .el-dialog--center {
    padding: 0;
  }
}

.popup-header {
  width: 100%;
  z-index: 1001;
  display: flex;
  align-items: center;
  padding: 10px 0;
  .popup-title {
    flex: 1;
    font-size: 14px;
    font-weight: bold;
    line-height: 14px;
    padding: 0 20px;
  }
  .popup-close-btn {
    cursor: pointer;
    padding: 4px 20px;
    border-radius: 3px;
    color: #909399;
    font-size: 20px;
    line-height: 14px;
  }
}

.has-title {
  background-color: #f2f3f6;
}

.popup-box {
  background-color: #fff;
  .slot-box {
    padding: 15px;
    overflow: auto;
  }
}
</style>
