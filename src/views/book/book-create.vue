<template>
  <div>
    bookCreate
    <el-button type="primary" @click="handleClick">
      按钮
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'BookCreate',
  components: {

  },
  data() {
    return {

    }
  },
  methods: {
    // handleClick() {
    //   /**
    //     这里只是模拟，实际应用中肯定条件比这个复杂
    //     且并不是用Array方法能替换的问题: 如 find、findIndex、some、every
    //    */
    //   let arr = [
    //     {index: 1},
    //     {index: 2},
    //     {index: 3}
    //   ];
    //   let flag = false;
    //   arr.forEach(i =>{
    //     // 真实场景中的肯定不是对象index的条件
    //     if (i.index === 2) {
    //       console.log('提示用户，整个方法不在执行！指的是 => handleClick')
    //       flag = true;
    //     }
    //     if (flag === true) return;

    //     // 执行一大堆逻辑....

    //   })
    //   if (flag === true) return;

    //   // 一大坨业务处理

    // }

    handleClick() {
      /**
        这里只是模拟，实际应用中肯定条件比这个复杂
        且并不是用Array方法能替换的问题: 如 find、findIndex、some、every
       */
      const arr = [
        { index: 1 },
        { index: 2 },
        { index: 3 }
      ]
      arr.forEach((i, index) => {
        if (i.index === 2) {
          this.$showError('123123')
        }
      })

      //
      console.log(111)

      /*  var array = [1, 2, 3, 4, 5];
    array.forEach(function(item, index) {
        if (item === 2) {
          debugger
          array = array.concat(array.splice(index, array.length - index));
        }
        console.log(item); //只输出1,2
    }); */
    }
  }
}
</script>

<style scoped lang="scss">

</style>
