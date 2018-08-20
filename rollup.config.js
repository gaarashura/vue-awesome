import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import alias from 'rollup-plugin-alias'
import path from 'path'
export default {
  input: 'src/index.js',
  external: [
    'vue'
  ],
  output: {
    name: 'VueAwesome',
    file: 'dist/vue-awesome.js',
    format: 'umd',
    globals: {
      vue: 'Vue'
    }
  },
  plugins: [
    vue({
      compileTemplate: true,
      css: true
    }),
    buble(),
    alias({
      resolve: ['.vue', '.js'],
      '@': path.resolve(__dirname,'./src')
    }),
    uglify()
  ]
}
