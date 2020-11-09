<template>
 <div class="B">
  <div class="title">我是B</div>
 <p>foo:{{foo}}</p>
 <p>attrs:{{$attrs}}</p>
 <C v-bind="$attrs" v-on="$listeners"  @blurHandle="blurHanlde"></C>
 </div>
</template>
<script>
import C from './C';
export default {
 name:'B',
 inheritAttrs:true,
 components: {C},
 props:["foo"],
 data() {
   return {
     BAttr: '123'
   }
 },
 methods: {
   blurHanlde() {
     console.log('B组件监听到了');
   }
 },
 mounted() {
   console.log(this.$attrs);
 }
}
</script>
<style lang="scss">
.title {
  font-weight: bold;
  color: red
}
</style>