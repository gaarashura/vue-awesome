const glob = require('glob')
const path = require('path')
const xml2js = require('xml2js')
const fs = require('fs')
const {promisify} = require('util')
const svgFiles = glob.sync('./icon-srouce/**/*.svg')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const jsFileRegexp = /\/[A-z0-9\-]*\.js/g
const prefixRegexp = /\.\/icon\-srouce\//g
const componentPath = path.resolve(__dirname, './components/Icon.vue')
const indexjs = path.resolve(__dirname, './icons')
let indexText = ``// icons/index.js中的内容

/**
 *
 * @param svgJson svg xml解析后的JSON数据
 * @param fileName  icons下的文件名
 * @param componentRelativePath icon文件引用Icon.vue的相对路径
 * @param indexjsRelativePath icon/index.js引用icon/xxx.js的相对路径
 * @returns {string}
 */
function genText (svgJson, fileName, componentRelativePath, indexjsRelativePath) {// 生成JS文件内容
  indexText += `
    import './${pathFormat(indexjsRelativePath)}'
  `
  return `import Icon from './${pathFormat(componentRelativePath)}'
Icon.register(${JSON.stringify(svgJson)})
          `
}

function pathFormat (p) {
  return p.split(path.sep).join('/')
}

const queue = svgFiles.map(async p => {
  const parser = new xml2js.Parser()
  const parseString = promisify(parser.parseString)
  const data = await readFile(p)
  const result = await parseString(data)
  const fileName = p.replace(prefixRegexp, '').replace(/\.svg$/, '.js')
  const output = path.resolve(__dirname,`./icons/${fileName}`)
  const componentRelativePath =path.relative(pathFormat(output).replace(jsFileRegexp,''), componentPath)
  const indexjsRelativePath = path.relative(indexjs, output)
  const {viewBox} = result.svg.$
  const paths = result.svg.path.map(i => {
    return {
      d: i.$.d
    }
  })
  const svgJson = {
    [fileName.replace(/\.js$/, '')]: {
      width: viewBox.split(' ')[2],
      height: viewBox.split(' ')[3],
      paths
    }
  }
  writeFile(output, genText(svgJson, fileName, componentRelativePath, indexjsRelativePath))
})
Promise.all(queue).then(r => {
  writeFile(path.resolve(__dirname, `./icons/index.js`), indexText)
})
