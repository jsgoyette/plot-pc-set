#!/usr/local/bin/node

var fs = require('fs'),
	uglify = require('uglify-js')

var pcJS = fs.readFileSync(__dirname + '/plot-pc-set.js').toString(),
	p2pJS = fs.readFileSync(__dirname + '/pcstr2pcs.js').toString(),
	copy = '/* Copyright (c) 2012 Jeremiah Goyette */'

console.log('building and minifying...')
buildFile(pcJS, 'plot-pc-set.min.js')
//buildFile(p2pJS + '\n\n' + pcJS, 'setgraph.min.js')
console.log('done')

function buildFile(js, name) {
	var ast = uglify.parser.parse(js)
	ast = uglify.uglify.ast_mangle(ast)
	ast = uglify.uglify.ast_squeeze(ast)
	var minifiedJS = uglify.uglify.gen_code(ast)
	fs.writeFile(__dirname + '/' + name, copy + '\n' + minifiedJS)
}

