<template>
  <div class="A">
    <DynamicSelect
      ref="DynamicSelect"
      :value.sync="projectId"
      v-bind="projectSelectOption"
      :parse-data="parseData"
      :formatter="formatterValue"
      :multiple="true"
      collapse-tags
      :slots="customSlots"
      :props="props"
    >
      <el-tag
        slot="selectAll"
        type="primary"
        class="select-tag-class"
        @click="handleSelectAll"
      >
        {{ selectAllLabel[selectAll] }}
      </el-tag>
    </DynamicSelect>
  </div>
</template>

<script>
import DynamicSelect from '@/components/common/DynamicSelect'
import DataTableMixin from '@/mixins/DataTableMixin'
import { requestUrl } from '@/api/constant'
const props = {
  label: 'proName',
  value: 'id',
  children: 'children',
  labelRender(h, label, item) {
    return [h('span', {
      staticClass: 'left',
      domProps: {
        innerText: label
      }
    }),
    h('span', {
      staticClass: 'right',
      domProps: {
        innerText: item?.id.substr(0, 2) || ''
      }
    })]
  }
}

export default {
  name: 'A',
  components: {
    DynamicSelect
  },
  mixins: [DataTableMixin],
  data() {
    return {
      projectId: '',
      customSlots: {
        prefix: this.prefixRender
      },
      selectAllLabel: {
        false: '全选',
        true: '取消',
      },
      selectAll: false,
      props: Object.freeze(props),
      formModel: {
        projectEntrys: []
      }
    }
  },
  created() {
    // console.log(this)
  },
  methods: {

    prefixRender(h, vue) {
      return h('div', {
        staticClass: 'select-prefix',
      },
      [h('svg-icon', {
        props: {
          'icon-class': 'bug'
        },
      })])
    },

    handleSelectAll() {
      this.selectAll = !this.selectAll
      const list = []
      if (this.selectAll) { // 全选
        this.$refs.DynamicSelect.optionsData.forEach(item => list.push(item['id']))
        this.formModel.projectEntrys = [{ projectSettings: { id: 'all', label: '全部' }}]
      } else {
        this.formModel.projectEntrys = []
      }
      this.$refs.DynamicSelect.newValue = list
    },

    parseData(data) {
      return { data: data.data.pageData }
    },

    formatterValue(val) {
      return val
    }
  }
}
</script>

<style scoped lang="scss">
.A ::v-deep {

  .el-select__input {
    margin-left: 18px;
  }
  .select-prefix {
    height: 100%;
    display: flex;
    align-items: center;
  }

}

.select-tag-class {
  width: 96%;
  /*margin: 0 2% 1% 2%;*/
  margin: 2%;
  text-align: center;
  border-color: #b3d8ff;
  cursor: pointer;

}
.select-tag-class:hover {
  background-color: rgb(226, 240, 255);
}
.select-tag-class:active {
  background-color: #d9ecff;
}

.el-select-dropdown__item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
</style>

