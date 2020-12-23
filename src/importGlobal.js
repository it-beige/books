
// /**
//  * @description: 根据指定路径匹配文件
//  * @param {String} targetPath 要引用文件的路径
//  * @param {Boolean} deepImport 是否遍历子目录
//  * @param {RegExp} pathReg 匹配文件路径的正则
//  */
// export function importGlobal(options, Vue) {
//   const {
//     targetPath,
//     deepImport,
//     pathReg,
//   } = options
//   const r = require.context(targetPath, true, /\.vue$/)
//   r.keys().forEach(path => {
//     const filePath = path.substr(2)
//     console.log('./components/common/' + filePath)
//     console.log(require('./components/common/' + filePath))
//   })
// }
