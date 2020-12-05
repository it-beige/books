<template>
  <div class="blog-article">
    <ul>
      <li
        v-for="(item, index) in blogArticleList"
        :key="index"
        class="item"
      >
        <a :href="item.link" target="_blank">{{ item.title }}</a>
      </li>
    </ul>

  </div>
</template>

<script>
import blogArticleList from '@/mixins/blogArticleList'
export default {
  name: 'Blog',
  mixins: [blogArticleList],
}
</script>

<style scoped lang="scss">
@import 'styles/variables';

.blog-article {
  display: flex;
  flex-direction: column;
  .item {
    flex: 1;
    list-style: none;
    margin-top: 50px;
    margin-left: 50px;
    position: relative;
  }
  .item::before {
    content: '';
    background: url('/beige.png') center center no-repeat;
    background-size: 90%;
    position: absolute;
    top: -20px;
    left: -50px;
    width: 50px;
    height: 50px;
    border: 2px solid $green;
    border-radius: 50%;
  }
}
</style>
