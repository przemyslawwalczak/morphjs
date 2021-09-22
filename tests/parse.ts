import * as acorn from 'acorn'
import * as jsx from 'acorn-jsx'
import * as fs from 'fs'

const parser = acorn.Parser.extend(
   jsx({
      allowNamespacedObjects: true,
      allowNamespaces: true
   })
)

const html = fs.readFileSync('./test.jsx', { encoding: 'utf-8' })

console.log(html)

const parsed = parser.parse(html, {
   ecmaVersion: 'latest',
   sourceType: 'module'
})

console.log(parsed)

// const res = acorn.Parser.extend(jsx({ allowNamespacedObjects: true, allowNamespaces: true })).parse(HTML5, {
//    ecmaVersion: 'latest',
// })

// console.log(res)
