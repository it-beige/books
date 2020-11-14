<template>
  <!-- 自定义容器 -->
  <div class="right-group">
    <div class="item">
      <h3 class="title">关注作者公众号</h3>
      <span class="desc">自学路上一起进步!</span>
      <img
        width="100%"
        src="http://resource.beige.world/imgs/gongconghao.png"
      >
    </div>
    <div class="item">
      <h3 class="title">加入前端自学交流群</h3>
      <span
        class="desc"
      >扫描二维码回复 <span class="inner">加群</span> 学习</span>
      <img width="100%" src="http://resource.beige.world/imgs/weixin.png">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Author',
  components: {},
  data() {
    return {}
  }
}
</script>

<style scoped lang="scss">
// 自定义容器
.right-group {
  position: fixed;
  right: 0px;
  top: 100px;
  width: 150px;
  padding: 18px 13px;
  background-color: #fff;
  box-shadow: -1px 0 2px 0.5px rgba(0, 127, 255, 0.2);
  .item:last-child {
    margin-bottom: 0;
  }
  .item {
    text-align: center;
    font-family: Roboto, Lato, sans-serif;
    margin-bottom: 40px;
    .title {
      font-size: 15px;
      color: #007fff;
      margin: 0;
    }
    .desc {
      font-size: 12px;
      margin: 15px 0;
      .inner {
        color: #007fff;
        font-weight: 700;
      }
    }
  }
}

.card {
  position: fixed;
  top: 200px;
  left: 120px;
  color: #fff;
  font-size: 80px;
  transform: rotate(-45deg);
  box-shadow: 2px 3px 3px #ccc;
}
</style>
