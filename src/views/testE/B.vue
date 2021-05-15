<template>
  <div class="B">
    <div class="title">我是B</div>
    <p>foo:{{ foo }}</p>
    <p @click="clickTextHandle">attrs:{{ $attrs }}</p>
    <C v-bind="$attrs" v-on="$listeners" @blurHandle="blurHanlde" />
  </div>
</template>
<script>
/* eslint-disable */

import C from './C'
export default {
  name: 'B',
  components: { C },
  inheritAttrs: true,
  //  inject: ['A'],
  inject: {
    A: { default: {}}
  },
  props: ['foo'],
  data() {
    return {
      BAttr: '123'
    }
  },
  mounted() {
    console.log(this.$attrs)
    console.log(this.A, '------------------->B')
  },
  methods: {
    blurHanlde() {
      console.log('B组件监听到了')
    },
    clickTextHandle($e) {
      const p = { name: 123 }
      console.log($e)
      const obj = { ev: $e, p }
      this.$emit('clickTextHandle', obj)
    }
  }
}
</script>
<style lang="scss">
.title {
  font-weight: bold;
  color: red;
}
</style>
