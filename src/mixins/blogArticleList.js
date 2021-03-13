export default {
  data() {
    return {
      blogArticleList: [
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想开发中后台项目 (一)',
          link: 'https://juejin.cn/post/6913092522814210061'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
        {
          title: '【博客系列文章】以模块化的思想来搭建中后台项目',
          link: 'https://juejin.im/post/6894412199700201485'
        },
      ]
    }
  },
  created() {
    this.$showSuccess(`欢迎你${this.$store.getters.name}`)
  }
}
