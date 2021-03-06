#!/usr/local/bin/node

var fs = require('fs'),
  uglify = require('uglify-js')

var pcJS = fs.readFileSync(__dirname + '/plot-pc-set.js').toString(),
  copy = '/*\n * plot-pc-set.js ~ Copyright (c) 2012 Jeremiah Goyette\n */'

console.log('building and minifying...')
buildFile(pcJS, 'plot-pc-set.min.js')
console.log('done')

function buildFile(js, name) {
  // var ast = uglify.parser.parse(js)
  // ast = uglify.uglify.ast_mangle(ast)
  // ast = uglify.uglify.ast_squeeze(ast)
  // var minifiedJS = uglify.uglify.gen_code(ast)
  // fs.writeFile(__dirname + '/' + name, copy + '\n' + minifiedJS)
  var result = uglify.minify(name);
  console.log(result.code);
}

