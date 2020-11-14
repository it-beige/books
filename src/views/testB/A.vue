<template>
  <div class="A">
    我是A
    <B
      :foo="foo"
      :coo="coo"
      :eee="eee"
      @upHot="upHot"
      @blurHandle="blurHanlde"
      @clickTextHandle="clickTextHandle(213, $event)"
    />
  </div>
</template>
<script>
import B from './B'
export default {
  name: 'A',
  provide() {
    return {
      A: this
    }
  },
  components: { B },
  data() {
    return {
      foo: '北歌',
      coo: '前端自学驿站',
      eee: '加微信itbeige: 回复加群，加入这个全栈项目交流群'
    }
  },
  methods: {
    upHot() {
      console.log('如果觉得文章不错，请点个赞噢！')
    },
    blurHanlde() {
      console.log('谢谢各位支持！')
    },
    clickTextHandle(pParms, mParams, $e) {
      console.log(pParms, mParams, $e)
    }
  }
}
</script>

<style lang="scss">
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
