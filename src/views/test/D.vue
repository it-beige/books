<template>
  <div></div>
</template>

<script>
export default {
  name: "",
  data() {
    return {};
  },
  components: {},
  methods: {
    handle() {
      let a = {
        user: {
          name: 'Beige',
          msg: '欢迎大家加入前端自学驿站互相交流群'
        },
        savoir: [1, 2, 3, 4]
      };

      let c = {
        user: {
          name: 'Beige',
          msg: '欢迎大家加入前端自学驿站互相交流群'
        },
        savoir: [1, 2, 3, 4]
      };

      let b = {
        user: {
          name: '微信号',
          age: 'itBeige'
        },
        savoir: [1, 2, 3, 4]
      };
      let isType = (type) => (obj) => Object.prototype.toString.call(obj) === `[object ${type.slice(0, 1).toUpperCase() + type.slice(1)}]`
      let isObject = isType('Object')
      let isArray = isType('Array')

      function compareObjVal(obj1, obj2) {
        for (const attr in obj1) {
          if (!obj1.hasOwnProperty(attr)) return;
          const a1 = isObject(obj1[attr]) 
          const a2 = isObject(obj2[attr])
          const arr1 = isArray(obj1)
          
          // 如果是对象继续判断
          if (a1 && a2) {
            return compareObjVal(obj1[attr], obj2[attr]);
          }

          //  如果是数组判断
          if (arr1) return obj1[attr].toString() === obj2[attr].toString()

          // 不是对象的就判断数值是否相等
          if (obj1[attr] !== obj2[attr]) {
            return false;
          }
        }

          return true;
      }
      console.log(compareObjVal(a, c));
    }
  },
  mounted() {
    this.handle()
  }
};
</script>

<style scoped></style>
