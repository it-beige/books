<script>
export default {
  created() {
    debugger
    const { params, query } = this.$route
    console.log(this.$route)
    const { path } = params
    this.$router.replace({ path: '/' + path, query })
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
