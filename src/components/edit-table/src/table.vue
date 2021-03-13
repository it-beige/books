<template>
    <div class="edit-table-box">
        <div class="top-tool-box">
            <div>
                <slot name="tableTitle"></slot>
                <slot name="prefix"></slot>
                <!-- <el-button
                    type="primary"
                    icon="el-icon-plus"
                    v-if="showAdd && enableEdit"
                    @click="addRow">
                    新增
                </el-button> -->
            </div>
            <div class="right-tool" v-if="controlBar.length>0">
                <el-tooltip effect="dark" content="编辑" placement="bottom" v-if="controlBar.includes('edit')">
                    <el-button type="success" icon="el-icon-edit" circle @click="handleControlBar('edit')"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除" placement="bottom" v-if="controlBar.includes('delete')">
                    <el-button type="danger" icon="el-icon-delete" circle @click="handleControlBar('delete')"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="刷新" placement="bottom" v-if="controlBar.includes('refresh')">
                    <el-button icon="el-icon-refresh" circle @click="$emit('refresh')"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="选择显示列" placement="bottom" v-if="controlBar.includes('column')">
                    <el-button icon="el-icon-menu" circle @click="tableColumnVisible = true"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="隐藏搜索框" placement="bottom" v-if="controlBar.includes('search')">
                    <el-button icon="el-icon-search" circle @click="$emit('search')"></el-button>
                </el-tooltip>
            </div>
        </div>
        <el-table
            v-if="doLayout"
            ref="dragTable"
            :border="border"
            style="width: 100%"
            v-loading="loading"
            :show-header="showHeader"
            :data="data"
            :height="height"
            :max-height="maxHeight"
            :size="size"
            :cell-style="cellStyle"
            :span-method="spanMethod"
            :row-key="rowKeyField"
            :show-summary="showSummary"
            :sum-text="sumText"
            :summary-method="summaryMethod"
            :indent="16"
            :lazy="lazy"
            :load="load"
            :tree-props="treeProps"
            :default-expand-all="defaultExpandAll"
            @cell-click="cellClick"
            @cell-dblclick="cellDblClick"
            @row-click="rowClick"
            @selection-change="handleSelectionChange"
            highlight-current-row
            @current-change="handleCurrentChange">
            <el-table-column
                align="center"
                v-if="checkbox"
                type="selection"
                :reserve-selection="reserveSelection"
                width="50">
            </el-table-column>
            <el-table-column
                align="center"
                v-if="showNumber"
                :index="indexNumber"
                label="序号"
                type="index"
                width="55">
            </el-table-column>
            <edit-table-column
                v-for="item in dynamicColumn"
                :key="item.property"
                v-bind="$attrs"
                v-on="$listeners"
                :column="item"
                :overflowTip="!enableEdit && overflowTip"
                :enableEdit="enableEdit"
                :enableValidation="enableValidation">
                <template v-if="item.slot" slot-scope="scope" :slot="item.slot">
                    <slot :name="item.slot" :data="scope.data"></slot>
                </template>
            </edit-table-column>
            <el-table-column
                label="操作"
                v-if="toolBar"
                :width="toolBarWidth"
                :min-width="toolBarMinWidth"
                :fixed="toolBarFixed"
                align="center">
                <template slot-scope="scope">
                    <slot name='toolbar' :data="{scope}"></slot>
                </template>
            </el-table-column>
            <no-data slot="empty"></no-data>
        </el-table>
        <el-scrollbar :native="true">
            <div class="page-box" v-if="pageInfo.total && data.length">
                <el-pagination
                    layout="total,sizes,prev, pager, next,slot,jumper"
                    :total="pageInfo.total"
                    :page-sizes="pageSizes"
                    :page-size.sync="offset"
                    @size-change="handleSizeChange"
                    :current-page.sync="currentPage"
                    @current-change="handlePageChange">
                    <span class="page">共{{getPages(pageInfo.total,offset)}}页</span>
                </el-pagination>
                <el-button type="primary" size="mini">
                    确定
                </el-button>
            </div>
        </el-scrollbar>
        <el-dialog title="表格列" :visible.sync="tableColumnVisible">
            <el-transfer v-model="showColumn" :data="transData" :titles="['隐藏列','显示列']"></el-transfer>
        </el-dialog>
    </div>
</template>

<script>
    import {deepClone} from "./util"
    import Sortable from 'sortablejs'
    import { MessageBox, Message } from 'element-ui'
    import NoData from "@/components/nodata";

    export default {
        name: "Table",
        components: {
            NoData
        },
        props: {
            height: {
                type: String | Number,  // 表格高度
            },
            maxHeight: {
                type: String | Number,  // 表格最大高度
            },
            size: {
                type: String,
                default: 'medium'
            },
            border: {
              type: Boolean, // 是否带有纵向边框
              default: false
            },
            checkbox: {
                type: Boolean, // 是否显示多选框
                default: false
            },
            showNumber: {
                type: Boolean, // 是否显示序号
                default: false
            },
            showAdd: {
                type: Boolean, // 是否显示新增行按钮 （enableEdit = true时生效）
                default: false
            },
            showHeader: {   // 是否显示表头
                type: Boolean,
                default: true
            },
            enableEdit: {
                type: Boolean, // 是否启用可编辑表格
                default: false
            },
            head: {
                type: Array, // 表头数据
                required: true
            },
            data: {
                type: Array, // 表体数据
                default: () => ([])
            },
            rowKeyField: {
                type: String, // 行标识字段名
            },
            toolBar: {
                type: Boolean, // 是否显示操作栏
                default: true
            },
            toolBarFixed: {
                type: Boolean | String, // 是否固定作栏
                default: false
            },
            toolBarWidth: {
                type: Number | String,  // 操作栏的宽度
            },
            toolBarMinWidth: {
                type: Number | String,  // 操作栏的最小宽度
            },
            pageInfo: {
                type: Object,  // 分页信息
                default: () => ({})
            },
            cellStyle: {
                type: Function // 单元格的样式 (参照element-ui)（enableEdit = false时生效）
            },
            spanMethod: {
                type: Function  // 单元格合并 (参照element-ui)
            },
            showSummary: {
                type: Boolean, // 是否显需要在表格尾部展示合计行
                default: false
            },
            sumText: {
                type: String, // 表格尾部展示合计列名
            },
            summaryMethod: {
                type: Function,  // 自定义的合计方法 (参照element-ui)
            },
            enableDrag: {
                type: Boolean,  // 是否开启表格行拖拽
                default: false
            },
            loading: {
                type: Boolean,  // 数据加载中动画
                default: false
            },
            overflowTip: {
                type: Boolean,  // 数据超出省略 鼠标移上去提示完整内容（enableEdit = false时生效）
                default: true
            },
            reserveSelection: {
                type: Boolean,  // 为 true 则会在数据更新之后保留之前选中的数据（需指定 row-key）
                default: false
            },
            lazy: {
                type: Boolean,  //  是否开启树型表格数据懒加载
                default: false
            },
            load: {
                type: Function,  // 树型表格数据加载方法 （lazy = true 时生效）
            },
            treeProps: {    // 树型表格 树的key
                type: Object,
                default: () => ({ hasChildren: 'hasChildren', children: 'children' })
            },
            defaultExpandAll: {  // 是否默认展开所有行
                type: Boolean,
                default: false
            },
            enableValidation: {  // 是否开启数据校验 （enableEdit = true时生效）
                type: Boolean,
                default: true
            },
            controlBar: {   // 表格的操作按钮  可选值['edit', 'delete', 'refresh','column', 'search']
                type: Array,
                default: () => ([])
            }
        },
        provide() {
            return {
                editTable: this
            }
        },
        data() {
            return {
                tableColumnVisible: false,  // 是否显示动态显示列穿梭框
                showColumn: [], // 显示的列
                transData: [],  // 总的列
                currentPage: 1, // 当前页码
                pageSizes: this.pageInfo.pageSizes ? this.pageInfo.pageSizes.sort((x, y) => x - y) : [10, 20, 50, 100, 200],    // 备选每页显示多少条数据
                offset: this.pageInfo.offset || 10, // 每页显示多少条数据
                initHead: [],   // 过滤掉隐藏的表头
                dynamicColumn: [],  // 动态显示列表头
                doLayout: true, // 控制表格重新渲染显示
                selectionData: [],  // 勾选的数据
                currentRowData: {}  // 当前行数据
            }
        },
        computed: {
            indexNumber() {
                return this.offset * (this.currentPage - 1) + 1
            },
        },
        watch: {
            showColumn: {
                handler() {
                    this.doLayout = false;
                    this.$nextTick(() => {
                        this.dynamicColumn = this.filterDynamicHiddenColumn(this.initHead)
                        this.doLayout = true;
                        this.$nextTick(() => {
                            this.$refs.dragTable.doLayout();
                            if (this.enableDrag) {
                                this.setSort()
                            }
                        });
                    });
                },
                deep: true,
                immediate: true
            }
        },
        created() {
            this.initHead = this.filterHiddenColumn(this.head)
            this.initTableColumn(this.initHead)
        },
        mounted() {
            if (this.enableDrag) {
                this.$nextTick(() => {
                    this.$nextTick(() => {
                        this.setSort()
                    })
                })
            }
        },
        methods: {
            addRow() {
                this.data.push({enableEdit: true})
            },
            /**
             * 跳页事件
             * @param val
             */
            handlePageChange(val) {
                this.$emit('handlePageChange', val)
            },
            /**
             * 改变每页显示多少条
             */
            handleSizeChange(val) {
                this.$emit('handleSizeChange', val)
            },
            /**
             * 多选框事件
             * @param val
             */
            handleSelectionChange(val) {
                this.selectionData = val
                this.$emit('handleSelectionChange', val)
            },
            /**
             * 单选框事件
             */
            handleCurrentChange(val) {
                this.currentRowData = val || {}
                this.$emit('handleCurrentChange', val)
            },
            /**
             * 单元格点击事件
             * @param row
             * @param column
             */
            cellClick(row, column) {
                if (!this.enableEdit) {
                    this.$emit('cellClick', row, column)
                }
            },
            /**
             * 单元格双击事件
             * @param row
             * @param column
             */
            cellDblClick(row, column) {
                if (!this.enableEdit) {
                    this.$emit('cellDblClick', row, column)
                }
            },
            /**
             * 行单击事件
             * @param row
             */
            rowClick(row) {
                if (!this.enableEdit) {
                    this.$emit('rowClick', row)
                }
            },
            /**
             * 计算分页
             * @param total
             * @param offset
             * @returns {number}
             */
            getPages(total, offset) {
                if (total % offset === 0) {
                    return total / offset
                } else {
                    return parseInt(total / offset) + 1
                }
            },
            /**
             * 表格行拖拽
             */
            setSort() {
                const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
                this.sortable = Sortable.create(el, {
                    ghostClass: 'sortable-ghost',
                    setData: dataTransfer => {
                        dataTransfer.setData('Text', '')
                    },
                    onEnd: evt => {
                        const targetRow = this.data.splice(evt.oldIndex, 1)[0]
                        this.data.splice(evt.newIndex, 0, targetRow)
                    }
                })
            },
            /**
             * 初始化显示的列
             * @param data
             */
            initTableColumn(data = []) {
                for (const item of data)  {
                    if (item.children instanceof Array && item.children.length) {
                        this.initTableColumn(item.children)
                    } else {
                        const obj = {
                            key: item.property,
                            label: item.label,
                        }
                        this.showColumn.push(obj.key)
                        this.transData.push(obj)
                    }
                }
            },
            /**
             * 过滤隐藏字段
             * @param data
             * @returns {*[]}
             */
            filterHiddenColumn(data = []) {
                return data.filter(item => {
                    if (item.children instanceof Array && item.children.length) {
                        item.children =  this.filterHiddenColumn(item.children)
                    }
                    return !item.hidden
                })
            },
            /**
             * 动态显示隐藏列
             * @param data
             * @returns {*}
             */
            filterDynamicHiddenColumn(data = []) {
                const columns = deepClone(data)
                return columns.filter(item => {
                    if (item.children instanceof Array && item.children.length) {
                        item.children =  this.filterDynamicHiddenColumn(item.children)
                        return item.children.length
                    } else {
                        return this.showColumn.includes(item.property)
                    }
                })
            },
            /**
             * 处理编辑 删除 按钮事件
             * @param sign
             */
            handleControlBar(sign) {
                const that = this
                if (that.selectionData.length) {
                    if (sign === 'delete') {
                        MessageBox.confirm(
                            '确定删除选中的数据吗？',
                            '提示',
                            {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }
                        ).then(() => {
                            that.$emit(sign,  deepClone(that.selectionData))
                            that.selectionData = []
                        })
                    } else {
                        if (that.selectionData.length > 1) {
                            Message({
                                message: '只能选择一条数据操作',
                                type: 'warning'
                            });
                            return
                        }
                        that.$emit(sign, that.selectionData[0])
                    }
                } else if (Object.keys(that.currentRowData).length) {
                    if (sign === 'delete') {
                        MessageBox.confirm(
                            '确定删除选中的数据吗？',
                            '提示',
                            {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }
                        ).then(() => {
                            that.$emit(sign, new Array(deepClone(that.currentRowData)))
                        })
                    } else {
                        that.$emit(sign, that.currentRowData)
                    }
                } else {
                    Message({
                        message: '请先选择数据',
                        type: 'warning'
                    });
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    $primary: #1C9CFF;
    .edit-table-box {
        .top-tool-box {
            display: flex;
            margin: 10px 0;
            justify-content: space-between;
            &>div {
                width:100%;
            }
            .right-tool {
            }
        }
        .table-title {
            background-color: $primary;
            height: 25px;
            color: white;
            width: 150px;
        }
        //修改ele原生样式
        .el-table {
            ::v-deep  thead {
                th, .gutter {
                    background-color: $primary;
                    font-weight: normal;
                    color: white;
                    // text-align: center;
                    padding: 5px 0;
                    display: table-cell !important;
                }
            }
            ::v-deep  tbody {
                .gutter {
                    display: table-cell !important;
                }
                .cell {
                    /*text-align: center;*/
                }
                .el-table__row td {
                    padding: 5px 0;
                    /*text-align: center;*/
                }
            }
            ::v-deep  .el-icon {
                vertical-align: middle;
            }
            ::v-deep  .el-table__body {
                cursor: pointer;
            }
            ::v-deep  .el-table__row {
                .el-input, .el-textarea {
                    width: 100%;
                    height: 100%;
                    .el-icon-arrow-up {
                        display: none;
                    }
                    input::-webkit-outer-spin-button,
                    input::-webkit-inner-spin-button {
                        -webkit-appearance: none !important;
                        margin: 0;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                    }
                }
                .is-disabled {
                    .el-input__inner {
                        color: #606266;
                        cursor: text;
                    }
                }
                ::v-deep  .el-input__inner, .el-textarea__inner {
                    width: 100%;
                    padding: 0;
                    border: none;
                    background: none;
                    text-align: center;
                }
                ::v-deep  .el-textarea__inner {
                    vertical-align: middle;
                    resize: none;
                    overflow: hidden;
                    border-radius: 0;
                    font-family: 'PingFang SC', "Helvetica Neue", Helvetica, "microsoft yahei", arial, STHeiTi, sans-serif;

                }
                .el-date-editor {
                    .el-input__inner {
                        cursor: pointer;
                    }
                    .el-input__prefix {
                        display: none;
                    }
                }
                .el-checkbox {
                    .is-disabled {
                        .el-checkbox__inner {
                            cursor: pointer;
                        }
                    }
                }
            }
        }
        .upload-box {
            ::v-deep  .el-upload {
                display: flow-root;
            }
            ::v-deep  .el-upload--text {
                width: 100%;
                height: 100%;
                border: none;
                background: none;
                .text-box {
                    .el-icon-upload {
                        font-size: 20px;
                        color: $primary;
                        vertical-align: middle;
                        margin: 0;
                    }
                }
            }
        }
        .is-error {
            color: #ff4949;
            font-size: 12px;
            line-height: 1;
        }
    }

    .page-box {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .add-hang {
        font-size: 14px;
        display: flex;
        justify-content: center;
        border: 1px solid #e8e8e8;
        border-top: none;
        flex: 1;
        padding: 10px;
        text-align: center;
        cursor: pointer;
        i {
            margin-right: 10px;
            font-size: 16px;
            vertical-align: middle;
        }
        .active {
            color: #7bbbf1;
            display: block;
        }
    }
    .card-titles {
        margin-top: -10px;
        &>div:first-child{
            font-size:16px;
            font-weight: 600;
            color: #009ea1;
        }
        &>div:last-child{
            margin-top:15px;
            margin-bottom:30px;
            height: 1px;
            width: 100%;
            background: #009ea1;
        }
    }
</style>
