<template>
  <div class="page-filter-container" @keydown.enter="search">
    <div class="filter-item prefix">
      <slot name="prefix"></slot>
    </div>
    <div :class="['filter-item', {'filter-header': item.filterHeader}]" v-for="(item, index) in getFieldConfigList()" :key="index">
      <label
        class="filter-label"
        v-if="item.type !== 'button' && item.type !== 'group-input' && item.label && !item.hiddenLabel"
      >{{item.label}}</label>
      <!-- 输入框 -->
      <el-input
        :class="`filter-${item.type}`"
        v-if="item.type === 'input'"
        :type="item.type"
        :disabled="item.disabled"
        :clearable="item.clearable === false ? item.clearable : true"
        :placeholder="getPlaceholder(item)"
        @focus="handleEvent(item.event)"
        v-model.trim="searchQuery[item.key]"
      ></el-input>
      <!-- 组合文本框 -->
      <el-input
        class="input-with-select"
        :class="`filter-${item.type}`"
        v-if="item.type === 'group-input' && searchQuery[item.key]"
        :type="item.type"
        :disabled="item.disabled"
        :clearable="item.clearable === false ? item.clearable : true"
        :placeholder="getPlaceholder(item)"
        @focus="handleEvent(item.event)"
        v-model="searchQuery[item.key].value"
      >
        <el-select
          v-model="searchQuery[item.key].field"
          slot="prepend"
          @change="handleGroupFieldChange($event, item)"
        >
          <el-option
            v-for="(field, index) in item.data"
            :key="index"
            :label="field.label"
            :value="field.value"
          ></el-option>
        </el-select>
      </el-input>

      <!-- 选择框 -->
      <el-select
        :class="`filter-${item.type}`"
        v-if="item.type === 'select'"
        v-model="searchQuery[item.key]"
        :disabled="item.disabled"
        @change="handleEvent(item.event)"
        :clearable="item.clearable === false ? item.clearable : true"
        :filterable="item.filterable === false ? item.filterable : true"
        :placeholder="getPlaceholder(item)"
      >
        <el-option
          v-for="(itm, index) in item.data"
          :key="index"
          :label="itm.label"
          :value="itm.value"
        ></el-option>
      </el-select>

      <!-- 时间选择框 -->
      <el-time-select
        :class="`filter-${item.type}`"
        v-if="item.type === 'time'"
        v-model="searchQuery[item.key]"
        :picker-options="item.TimePickerOptions"
        :clearable="item.clearable === false ? item.clearable : true"
        :disabled="item.disabled"
        :placeholder="getPlaceholder(item)"
      ></el-time-select>
      <!-- 日期选择框 -->
      <el-date-picker
        :class="`filter-${item.type}`"
        v-if="item.type === 'date'"
        v-model="searchQuery[item.key]"
        :picker-options="item.datePickerOptions || datePickerOptions"
        :type="item.dateType"
        :clearable="item.clearable === false ? item.clearable : true"
        :disabled="item.disabled"
        @focus="handleEvent(item.event)"
        :placeholder="getPlaceholder(item)"
      ></el-date-picker>
      <!-- 按钮 -->
      <el-button
        :class="`filter-${item.type}`"
        v-else-if="item.type === 'button'"
        v-waves
        :type="item.btType"
        :icon="item.icon"
        @click="reset"
      >{{item.label}}</el-button>
      <!-- 组合输入框 -->
      <el-row :class="`filter-${item.type}`" v-if="item.type === 'input-with-input'">
        <el-col :span="11">
          <el-input
            type="input"
            v-if="searchQuery[item.key]"
            v-model="(searchQuery[item.key])[0]"
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
          ></el-input>
        </el-col>
        <el-col :span="2">-</el-col>
        <el-col :span="11">
          <el-input
            type="input"
            v-if="searchQuery[item.key]"
            v-model="(searchQuery[item.key])[1]"
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
          ></el-input>
        </el-col>
      </el-row>
    </div>
    <div class="filter-item" v-if="getFieldConfigList().length">
      <!-- 按钮 -->
      <el-button class="filter-button" icon="el-icon-search" v-waves type="primary" @click="search">搜索</el-button>
     <el-button class="filter-button" icon="el-icon-refresh-left" v-waves type="primary" @click="reset">重置</el-button>
    </div>
    <div class="filter-item add-btn">
      <slot name="next"></slot>
    </div>
    <div class="filter-item suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "DynamicSearch",
  props: {
    // 自定义类名
    className: {
      type: String
    },
    // 拦截器列表
    data: {
      type: Array,
      required: true
    },
    // 属性值集合
    listTypeInfo: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 是否显示label
    labelStatus: {
      type: Boolean,
      default: false
    }
      },
  data() {
    return {
      searchQuery: {},
      datePickerOptions: {
        // disabledDate (time) {
        //   // 大于当前的时间都不能选 (+十分钟让点击此刻的时候可以选择到当前时间)
        //   return time.getTime() > +new Date() + 1000 * 600 * 1
        // }
      }
    };
  },
  mounted() {
    this.initParams();
  },
  watch: {
    searchQuery: {
      handler(val) {
        this.$emit("search", val, true);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initParams() {
      const obj = Object.create(null);
      this.data.forEach(item => {
        if (item.key) {
          if (item.type === "group-input") {
            obj[item.key] = {
              field: item.value ? item.value.field : item.data[0].value,
              value: item.value ? item.value.value : ""
            };
          } else if (item.type === "input-with-input") {
            obj[item.key] = item.value || ["", ""];
          } else {
            obj[item.key] = item.value;
          }
        }
      });
      this.searchQuery = obj;
    },
    getPlaceholder(row) {
      let placeholder = "";
      if (
        row.type === "input" ||
        row.type === "textarea" ||
        row.type === "group-input" ||
        row.type === "input-with-input"
      ) {
        placeholder = "请输入";
      } else if (
        row.type === "select" ||
        row.type === "time" ||
        row.type === "date"
      ) {
        placeholder = "请选择";
      }
      if (row.label) {
        placeholder += row.label;
      }
      return placeholder;
    },
    // 获取字段配置项列表
    getFieldConfigList() {
      return this.data.filter(
        item =>
          !item.hasOwnProperty("hidden") ||
          (item.hasOwnProperty("hidden") && !item.hidden)
      );
    },
    // 绑定相关事件
    handleEvent(event) {
      if (event) this.$emit("handleEvent", event);
    },
    // 按钮点击事件
    handleClickBtn(event, data) {
      if (event) this.$emit("handleClickBtn", event, data);
    },
    handleGroupFieldChange(event, item) {
      const fields = item.data;
      const temp = fields.filter(field => field.value === event);
      item.label = temp[0].label;
      this.searchQuery[item.key].field = event;
    },
    // 点击搜索按钮的事件
    search() {
      const obj = {};
      Object.assign(obj, this.searchQuery);
      if (obj.groupInput) {
        const key = obj.groupInput.field;
        const val = obj.groupInput.value;
        this.$delete(obj, "groupInput");
        if (key && val) {
          this.$set(obj, key, val);
        }
      }
      this.$emit("search", obj);
    },
    // 重置按钮点击事件
    reset() {
      const obj = {};
      Object.assign(obj, this.searchQuery);
      for (const i in obj) {
        obj[i] = "";
      }
      for (const i in this.searchQuery) {
        this.searchQuery[i] = "";
      }
      this.$emit("reset", obj);
    }
  }
};
</script>
<style lang="scss" scoped>
.page-filter-container {
  position: relative;
  .filter-item {
    display: inline-flex;
    align-items: center;
    // margin-bottom: 7px;
    margin-right: 10px;
  }

  .filter-header {
    margin: 0 100px;
  }

  .prefix {
    margin-right: 0;
    float: left;
  }
  .suffix {
    margin-right: 0;
    float: right;
  }
  .filter-label {
    padding-right: 5px;
    font-size: 14px;
    color: #606266;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .filter-input,
  .filter-time,
  .filter-date,
  .filter-select {
    width: 180px;
  }
  // .filter-button {
  //   background: #009ea1;
  // }
  .input-with-select {
    ::v-deep  .el-select .el-input {
      width: 110px;
    }
    .el-input-group__prepend {
      background-color: #fff;
      ::v-deep  .el-input__inner {
        width: 150px;
      }
    }
  }
  .filter-input-with-input {
    display: flex;
    align-items: center;
    text-align: center;
  }
  .float-right {
    float: right;
  }
}
</style>
