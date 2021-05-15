<template>
  <div class="empty-data">
    <i class="iconfont iconmeiyougengduo" />
    <div class="text">暂无数据...</div>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.empty-data {
  padding: 30px;
  width: 100%;
  height: 100%;
  color: #999999ff;
  // text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .iconfont {
    font-size: 60px;
  }
  .text {
    width: 100%;
    font-size: 12px;
    line-height: 14px;
    text-align: center;
  }
}
</style>
