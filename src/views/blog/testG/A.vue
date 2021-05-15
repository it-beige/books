<template>
  <div class="A">
    我是A
    <B
      ref="AIMPORTB"
      :foo="foo"
      :coo="coo"
      :eee="eee"
      :name="name"
      @handlerClick="handlerClick"
    />
    <el-button type="primary" @click="isShow = true">显示弹框</el-button>
    <BaseDialog :show="isShow" @update:show="(show) => (isShow = show)" />
  </div>
</template>
<script>
import B from './B'
import BaseDialog from './BaseDialog'
export default {
  name: 'A',
  components: { B, BaseDialog },
  data() {
    return {
      coo: '1',
      foo: '1',
      eee: '1',
      name: '北歌',
      isShow: false
    }
  },
  methods: {
    handlerClick(data, $event) {
      console.log(data, $event)
      // callBack(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.A {
  font-weight: bold;
  text-align: center;
  margin: 100px auto;
  width: 500px;
  height: 400px;
  border: 1px solid #000;
}

.B {
  margin: 0 auto;
  width: 300px;
  height: 350px;
  border: 1px solid red;
}

.C {
  margin: 0 auto;
  width: 200px;
  height: 200px;
  border: 1px solid green;
}
</style>
