'use test'
import { test } from 'tap'
import ReadModuleTree from '../src/index.js'
import through from 'through2'
import path from 'path'

console.log(ReadModuleTree)

test('start', function (t) {
  new ReadModuleTree(path.resolve('..')).pipe(through.obj(function (node) {
    console.log(node)
    t.end()
  }))
})
