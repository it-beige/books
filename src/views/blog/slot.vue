
<script>
export default {
  name: 'Header',
  components: {

  },
  inheritAttrs: false,
  data() {
    return {

    }
  },
  render(h, props) {
    console.log(this)
    return h('div', {
      domProps: {
        innerHTML: this.$attrs.name
      }
    })
  },
}
</script>

<style scoped lang="scss">

</style>

