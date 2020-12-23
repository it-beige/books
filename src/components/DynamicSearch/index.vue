<template>
  <div class="page-filter-container" @keydown.enter="search">
    <div class="filter-item prefix">
      <slot name="prefix" />
    </div>
    <el-row :span="24" class="form-item">
      <el-col v-for="(item, index) in getFieldConfigList()" :key="index" :class="['filter-item', item.itemClass]" :span="item.span || 6">
        <label
          v-if="item.type !== 'button' && item.type !== 'group-input' && item.label && !item.hiddenLabel"
          class="filter-label"
          :style="{'width': item.labelWidth || '100px','text-align':item.align || 'right'}"
        >{{ item.label }}</label>
        <!-- 输入框 -->
        <el-input
          v-if="item.type === 'input'"
          v-model="searchQuery[item.key]"
          :class="`filter-${item.type}`"
          :type="item.type"
          :disabled="item.disabled"
          :clearable="item.clearable === false ? item.clearable : true"
          :placeholder="getPlaceholder(item)"
          @focus="handleEvent(item.event)"
        />

        <!-- 组合文本框 -->
        <el-input
          v-if="item.type === 'group-input' && searchQuery[item.key]"
          v-model="searchQuery[item.key].value"
          class="input-with-select"
          :class="`filter-${item.type}`"
          :type="item.type"
          :disabled="item.disabled"
          :clearable="item.clearable === false ? item.clearable : true"
          :placeholder="getPlaceholder(item)"
          @focus="handleEvent(item.event)"
        >
          <el-select
            slot="prepend"
            v-model="searchQuery[item.key].field"
            @change="handleGroupFieldChange($event, item)"
          >
            <el-option
              v-for="(field, index) in item.data"
              :key="index"
              :label="field.label"
              :value="field.value"
            />
          </el-select>
        </el-input>

        <!-- 选择框 -->
        <el-select
          v-if="item.type === 'select'"
          :ref="item.key + 'selectRef'"
          v-model="searchQuery[item.key]"
          :class="`filter-${item.type}`"
          :multiple="item.multiple"
          :multiple-limit="item.limit"
          :collapse-tags="item.collapse"
          :disabled="item.disabled"
          :clearable="item.clearable === false ? item.clearable : true"
          :filterable="item.filterable === false ? item.filterable : true"
          :placeholder="getPlaceholder(item)"
          @change="handleEvent(item.event)"
        >
          <el-option v-if="item.isCheckAll" label="全选" value="全选" @click.native="selectAll(item, searchQuery[item.key], index)" />
          <el-option
            v-for="(i, index) in item.data"
            :key="index"
            :label="i[item.labelKey] || i.label"
            :value="i[item.valueKey] || i.value"
          />
        </el-select>

        <!-- 时间选择框 -->
        <el-time-select
          v-if="item.type === 'time'"
          v-model="searchQuery[item.key]"
          :class="`filter-${item.type}`"
          :picker-options="item.TimePickerOptions"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          :placeholder="getPlaceholder(item)"
        />
        <!-- 日期选择框 -->
        <el-date-picker
          v-if="item.type === 'date'"
          v-model="searchQuery[item.key]"
          :class="`filter-${item.type}`"
          :picker-options="item.datePickerOptions || datePickerOptions"
          :type="item.dateType"
          :clearable="item.clearable === false ? item.clearable : true"
          :disabled="item.disabled"
          :placeholder="getPlaceholder(item)"
          @focus="handleEvent(item.event)"
        />
        <el-date-picker
          v-else-if="item.type === 'datetimerange'"
          v-model="searchQuery[item.key]"
          v-model.trim="searchQuery[item.key]"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled="item.disabled"
          value-format="yyyy-MM-dd HH:mm:ss"
          @focus="handleEvent(item.event)"
        />
        <el-checkbox-group v-else-if="item.type==='checkbox'" v-bind="$attrs" v-on="$listeners">
          <component
            :is="item.button?'el-checkbox-button':'el-checkbox'"
            v-for="o in item.options"
            :key="o.value"
            :disabled="o.disabled"
            :label="o.value"
            :border="item.border"
          >{{ o.label }}</component>
        </el-checkbox-group>
        <!-- 按钮 -->
        <el-button
          v-else-if="item.type === 'button'"
          :class="`filter-${item.type}`"
          :type="item.btType"
          :icon="item.icon"
          @click="handleClickBtn(item.event)"
        >{{ item.label }}</el-button>
        <!-- 组合输入框 -->
        <el-row v-if="item.type === 'input-with-input'" :class="`filter-${item.type}`">
          <el-col :span="11">
            <el-input
              v-if="searchQuery[item.key]"
              v-model="(searchQuery[item.key])[0]"
              type="input"
              :disabled="item.disabled"
              :placeholder="getPlaceholder(item)"
            />
          </el-col>
          <el-col :span="2">-</el-col>
          <el-col :span="11">
            <el-input
              v-if="searchQuery[item.key]"
              v-model="(searchQuery[item.key])[1]"
              type="input"
              :disabled="item.disabled"
              :placeholder="getPlaceholder(item)"
            />
          </el-col>
        </el-row>
      </el-col>
      <el-col v-if="getFieldConfigList().length" :span="$attrs.searchSpan || 6" class="filter-item filter-btn-wrapper">
        <!-- 按钮 -->
        <el-button class="filter-button" icon="el-icon-search" type="primary" @click="search">查询</el-button>
        <el-button class="filter-button" icon="el-icon-refresh-left" @click="reset">重置</el-button>
      </el-col>
    </el-row>
    <div class="filter-item add-btn">
      <slot name="next" />
    </div>
    <div class="filter-item suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'DynamicSearch',
  props: {
    hiddenBtn: Boolean,
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
        return {}
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
    }
  },
  watch: {
    searchQuery: {
      handler(val) {
        this.$emit('search', val, true)
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.initParams()
  },
  methods: {
    initParams() {
      const obj = Object.create(null)
      this.data.forEach(item => {
        if (item.key) {
          if (item.type === 'group-input') {
            obj[item.key] = {
              field: item.value ? item.value.field : item.data[0].value,
              value: item.value ? item.value.value : ''
            }
          } else if (item.type === 'input-with-input') {
            obj[item.key] = item.value || ['', '']
          } else {
            obj[item.key] = item.value
          }
        }
      })
      this.searchQuery = obj
    },
    getPlaceholder(row) {
      let placeholder = ''
      if (
        row.type === 'input' ||
        row.type === 'textarea' ||
        row.type === 'group-input' ||
        row.type === 'input-with-input'
      ) {
        placeholder = '请输入'
      } else if (
        row.type === 'select' ||
        row.type === 'time' ||
        row.type === 'date'
      ) {
        placeholder = '请选择'
      }
      if (row.label) {
        placeholder += row.label
      }
      return placeholder
    },
    // 获取字段配置项列表
    getFieldConfigList() {
      return this.data.filter(
        item =>
          !item.hasOwnProperty('hidden') ||
          (item.hasOwnProperty('hidden') && !item.hidden)
      )
    },
    // 绑定相关事件
    handleEvent(event) {
      if (event) this.$emit('handleEvent', event)
    },
    // 按钮点击事件
    handleClickBtn(event, data) {
      if (event) this.$emit('handleClickBtn', event, data)
    },
    // 下拉框点击全选
    selectAll(item, value, $i) {
      if (Array.isArray(item.data)) {
        value.splice(0)
        item.data.forEach(i => value.push(i[item.labelKey]))
      }
      this.$refs[item.key + 'selectRef'] && this.$refs[item.key + 'selectRef'][0].blur()
    },
    handleGroupFieldChange(event, item) {
      const fields = item.data
      const temp = fields.filter(field => field.value === event)
      item.label = temp[0].label
      this.searchQuery[item.key].field = event
    },
    // 点击搜索按钮的事件
    search() {
      const obj = {}
      Object.assign(obj, this.searchQuery)
      if (obj.groupInput) {
        const key = obj.groupInput.field
        const val = obj.groupInput.value
        this.$delete(obj, 'groupInput')
        if (key && val) {
          this.$set(obj, key, val)
        }
      }
      if (this.searchQuery.logintime !== undefined && this.searchQuery.logintime !== '') {
        obj.startTime = this.searchQuery.logintime[0]
        obj.endTime = this.searchQuery.logintime[1]
      }
      this.$delete(obj, 'logintime')
      if (this.searchQuery.createTime !== undefined && this.searchQuery.createTime !== '') {
        obj.createBeginTime = this.searchQuery.createTime[0]
        obj.createEndTime = this.searchQuery.createTime[1]
      }
      this.$delete(obj, 'createTime')
      this.$emit('search', obj)
    },
    // 重置按钮点击事件
    reset() {
      const obj = {}
      Object.assign(obj, this.searchQuery)
      this.searchQuery = {}
      /* for (const i in obj) {
        obj[i] = ''
      }
      for (const i in this.searchQuery) {
        this.searchQuery[i] = ''
      } */
      this.$emit('reset', obj)
    }
  }
}
</script>
<style lang="scss" scoped>
.page-filter-container {
  position: relative;
  padding: 0 20px 0px 0;
  .filter-item {
    display: inline-flex;
    align-items: center;
    margin-bottom: 7px;
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
    width: 100%;
  }
  .filter-btn-wrapper{
    padding-left: 10px;
  }
  // .filter-button {
  //   background: #009ea1;
  // }
  .input-with-select {
    ::v-deep .el-select .el-input {
      width: 110px;
    }
    .el-input-group__prepend {
      background-color: #fff;
      ::v-deep .el-input__inner {
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
