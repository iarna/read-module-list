'use test'
var test = require('tap').test
var ReadModuleTree = require('../sync.js')
var Module = ReadModuleTree.Module
var path = require('path')
var realpath = require('fs').realpathSync

var testdir = path.join(__dirname, 'basic')
var realdir = realpath(testdir)

var expected = [
  new Module({name: "basic", path: testdir, modulePath: "/", realdir: realdir}),
  new Module({name: "@name/space", path: path.join(testdir, "node_modules", "@name", "space"), modulePath: "/@name/space", realdir: path.join(realdir, "node_modules", "@name", "space")}),
  new Module({name: "empty", path: path.join(testdir, "node_modules", "empty"), modulePath: "/empty", realdir: path.join(realdir, "node_modules", "empty")}),
  new Module({name: "hasdeps", path: path.join(testdir, "node_modules", "hasdeps"), modulePath: "/hasdeps", realdir: path.join(realdir, "node_modules", "hasdeps")}),
  new Module({name: "deep", path: path.join(testdir, "node_modules", "hasdeps", "node_modules", "deep"), modulePath: "/hasdeps/deep", realdir: path.join(realdir, "node_modules", "hasdeps", "node_modules", "deep")}),
  new Module({name: "plain", path: path.join(testdir, "node_modules", "hasdeps", "node_modules", "plain"), modulePath: "/hasdeps/plain", realdir: path.join(realdir, "node_modules", "plain")}),
  new Module({name: "plain", path: path.join(testdir, "node_modules", "plain"), modulePath: "/plain", realdir: path.join(realdir, "node_modules", "plain")})
]

test('basic', function (t) {
  var rmt = new ReadModuleTree(path.join(__dirname, 'basic'))
  t.isDeeply(rmt, expected, 'tree-read as expected')
  t.comment(JSON.stringify(rmt, null, 2))
  t.done()
})
