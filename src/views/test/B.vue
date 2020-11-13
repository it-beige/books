<template>
  <div class="B">
    <div class="title">我是B</div>
    <p>foo:{{ foo }}</p>
    <p @click="clickTextHandle">attrs:{{ $attrs }}</p>
    <C v-bind="$attrs" v-on="$listeners" @blurHandle="blurHanlde"></C>
  </div>
</template>
<script>
import C from "./C";
export default {
  name: "B",
  inheritAttrs: true,
  //  inject: ['A'],
  inject: {
    A: {default: {}}
  },
  components: { C },
  props: ["foo"],
  data() {
    return {
      BAttr: "123"
    };
  },
  methods: {
    blurHanlde() {
      console.log("B组件监听到了");
    },
    clickTextHandle($e) {
      let p = { name: 123}
      console.log($e);
      let obj = {ev: $e, p}
      this.$emit('clickTextHandle', obj)
    }
  },
  mounted() {
    console.log(this.$attrs);
    console.log(this.A, "------------------->B");
  }
};
</script>
<style lang="scss">
.title {
  font-weight: bold;
  color: red;
}
</style>
