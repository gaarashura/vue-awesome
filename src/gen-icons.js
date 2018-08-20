const glob = require('glob')
const path = require('path')
const xml2js = require('xml2js')
const fs = require('fs')
const {promisify} = require('util')
const svgFiles = glob.sync('./icon-srouce/**/*.svg')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const fileNameRegexp = /\/[A-z0-9\-]*\.svg$/g
const prefixRegexp = /\.\/icon\-srouce\//g

let indexText = ``// icons/index.js中的内容

function genText (svgJson, fileName) {// 生成JS文件内容
  indexText += `
    import '@/icons/${fileName}'
  `
  return `import Icon from '@/components/Icon.vue'
Icon.register(${JSON.stringify(svgJson)})
          `
}

const queue = svgFiles.map(async p => {
  const parser = new xml2js.Parser()
  const parseString = promisify(parser.parseString)
  const data = await readFile(p)
  const result = await parseString(data)
  const fileName = p.replace(prefixRegexp, '').replace(/\.svg$/, '.js')

  const output = path.resolve(__dirname, `./icons/${fileName}`)
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
  writeFile(output, genText(svgJson, fileName))
})
Promise.all(queue).then(r => {
  console.log(indexText)
  writeFile(path.resolve(__dirname, `./icons/index.js`), indexText)
})
