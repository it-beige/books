<template>
  <div @click="close">
    {{ dialogShow }}
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      requered: true
    }
  },
  data() {
    return {
      dialogShow: this.show
    }
  },
  watch: {
    show(val) {
      this.dialogShow = val
    },
    dialogShow(val) {
      this.$emit('update:isShow', val)
    }
  },
  methods: {
    close() {
      this.dialogShow = false
    }
  }
}
</script>

<style scoped lang="scss"></style>
