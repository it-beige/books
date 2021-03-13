<template>
  <div class="B">
    <div
      v-for="(item, $i) of list"
      :key="item.id"
      class="title"
      @click="clickHandler(item, $i, $event)"
    >
      我是B
    </div>
    <p>name:{{ name }}</p>
    <C />
  </div>
</template>

<script>
import C from './C'
export default {
  name: 'B',
  components: {
    C,
  },
  inheritAttrs: true,
  props: ['name'], // 接受父组件传递的数据
  data() {
    return {
      list: [{ name: 'Beige' }]
    }
  },
  methods: {
    clickHandler(item, $i, e) {
      // console.log(item, $i, e)
      this.$attrs.foo = '11111111111'
      console.log(this.$listeners, this.$attrs)
      // 向父组件传递数据
      this.$emit('handlerClick', { item, index: $i, event: e })
      // this.$emit('handlerClick')
    },
  }
}
</script>
<style lang="scss">
.title {
  font-weight: bold;
  color: red;
}
</style>
