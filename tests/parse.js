"use strict";
exports.__esModule = true;
var acorn = require("acorn");
var jsx = require("acorn-jsx");
var fs = require("fs");
var parser = acorn.Parser.extend(jsx({
    allowNamespacedObjects: true,
    allowNamespaces: true
}));
var html = fs.readFileSync('./test.jsx', { encoding: 'utf-8' });
console.log(html);
var parsed = parser.parse(html, {
    ecmaVersion: 'latest',
    sourceType: 'module'
});
console.log(parsed);
// const res = acorn.Parser.extend(jsx({ allowNamespacedObjects: true, allowNamespaces: true })).parse(HTML5, {
//    ecmaVersion: 'latest',
// })
// console.log(res)
