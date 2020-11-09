<template>
  <div class="C">
    <div class="title">我是C</div>
    <p>coo:{{ coo }}</p>
    <button @click="TopUp">我要上热门</button>
    <el-input @blur="myBlur"/>
  </div>
</template>
<script>
export default {
  name: "childDomChild",
  props: ["coo"],
  methods: {
    TopUp() {
      this.$emit("upHot");
      console.log("恭喜你上热门了!");
    },
    myBlur() {
      this.$emit("blurHandle");
      console.log(this.$attrs);
    }
  }
};
</script>
<style lang="scss" scoped>
.title {
  font-weight: bold;
  color: green
}
</style>
