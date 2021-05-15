/* eslint-disable */
import {
  saveAs
} from 'file-saver'

import XLSX from 'xlsx-style'


/************************* 样式信息 **************************** */ 
// 这是表头第一行的样式
export const firstTableHeadStyle = {
  font: {
    name: '宋体',
    sz: 14,
    color: {rgb: "#fff"},
    bold: true,
    italic: false,
    underline: false
  },
  alignment: {
    horizontal: "center",
    vertical: "center"
  },
  fill: {
    fgColor: {rgb: "bfbfbf"},
  },
  border: { 
    right: {
      style: 'thin'
    }
  }
}

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C]
      };
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R
      });

      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else cell.t = 's';
      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}



// 对此方法进行修改，如下：
export function export_json_to_excel({
  multiHeaders, // 表头
  dynamicFilterHeads = [], // 动态表头
  data,
  ws_name = '工作薄',
  filename, //文件名
  merges = [], // 合并
  autoWidth = true, // 单元格宽度是否auto
  bookType = 'xlsx',
  customRowStyleCallBack, // 自定义行的样式
  customMergesCallBack, // 自定义合并
  customColWidthCallBack, // 自定义列的宽度
} = {}) {
  return new Promise((resolve, reject) => {
    /* original data */
    filename = filename || '列表';
    data = [...dynamicFilterHeads, ...multiHeaders, ...data]
   
    var wb = new Workbook(),
      ws = sheet_from_array_of_arrays(data);

    if (merges.length > 0) {
      if (!ws['!merges']) ws['!merges'] = [];
      // 这里的自定义合并还是借助工具的合并规则
      // 如果想写原生合并规则在调用后面加个回调
      if (typeof customMergesCallBack === 'function') {
        customMergesCallBack(data)
      }
      merges.forEach(item => {
        ws['!merges'].push(XLSX.utils.decode_range(item))
      })
      
    }

    if (autoWidth) {
      /*设置worksheet每列的最大宽度*/
      const colWidth = data.map(row => row.map(val => {
        /*先判断是否为null/undefined*/
        if (val == null) {
          return {
            'wch': 10
          };
        }
        /*再判断是否为中文*/
        else if (val.toString().charCodeAt(0) > 255) {
          return {
            'wch': val.toString().length * 2.5
          };
        } else {
          return {
            'wch': val.toString().length * 2
          };
        }
      }))
      /*以第一行为初始值*/
      let result = colWidth[0];
      A: for (let i = 1; i < colWidth.length; i++) {
        B: for (let j = 0; j < colWidth[i].length; j++) {
          if (!result[j] || !colWidth[i][j]) continue B
          if (result[j]['wch'] < colWidth[i][j]['wch']) {
            result[j]['wch'] = colWidth[i][j]['wch'];
          }
        }
      }

      if (typeof customColWidthCallBack === 'function') {
        customColWidthCallBack(result)
      }

      ws['!cols'] = result;
    }

    

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var dataInfo = wb.Sheets[wb.SheetNames[0]];
    
    //单元格外侧框线
    const borderAll = { 
      top: {
        style: 'thin'
      },
      bottom: {
        style: 'thin'
      },
      left: {
        style: 'thin'
      },
      right: {
        style: 'thin'
      },
     
    };
    
    //给所有单元格加上边框
    for (var i in dataInfo) {
      if (i == '!ref' || i == '!merges' || i == '!cols' || i == 'A1') {

      } else {
        dataInfo[i + ''].s = {
          border: borderAll,
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          }    
        }
      }
    }


    if (typeof customRowStyleCallBack === 'function') {
      customRowStyleCallBack(dataInfo, data)
    }

    console.log(merges);
    console.log(dataInfo);


    var wbout = XLSX.write(wb, {
      bookType: bookType,
      bookSST: false,
      type: 'binary'
    });
    saveAs(new Blob([s2ab(wbout)], {
      type: "application/octet-stream"
    }), `${filename}.${bookType}`);

    resolve({code: 200, message: '导出成功!'})
  })
  
}
