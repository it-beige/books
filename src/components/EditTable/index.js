import Vue from 'vue';
import EditTable from './src/table';
import TableColumn from './src/column';
Vue.component('edit-table-column', TableColumn);
Vue.component('edit-table', EditTable);

export default EditTable;