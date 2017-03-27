'use strict'
const test = require('tap').test
const readModuleTree = require('../sync.js')
const Module = readModuleTree.Module
const path = require('path')
const realpath = require('fs').realpathSync
const Tacks = require('tacks')
const File = Tacks.File
const Symlink = Tacks.Symlink
const Dir = Tacks.Dir

const testdir = path.join(__dirname, path.basename(__filename, '.js'))

const fixture = new Tacks(
  Dir({
    node_modules: Dir({
      '@name': Dir({
        space: Dir({
          'package.json': File({
            name: '@name/space',
            version: '1.0.0'
          }),
          'node_modules': Dir({
            'scopechild': Dir({
              'package.json': File({
                name: 'scopechild',
                version: '1.0.0'
              })
            })
          })
        })
      }),
      empty: Dir({
        '.empty': File('')
      }),
      plain: Dir({
        'package.json': File({
          name: 'plain',
          version: '1.0.0'
        })
      }),
      hasdeps: Dir({
        node_modules: Dir({
          deep: Dir({
            'package.json': File({
              name: 'deep',
              version: '1.0.0'
            })
          }),
          plain: Symlink('/node_modules/plain')
        }),
        'package.json': File({
          name: 'hasdeps',
          version: '1.0.0'
        })
      })
    })
  })
)

let expected

test('setup', function (t) {
  fixture.remove(testdir)
  fixture.create(testdir)
  const realdir = realpath(testdir)
  expected = [
    new Module({name: "basic", path: testdir, modulePath: "/", realpath: realdir}),
    new Module({name: "@name/space", path: path.join(testdir, "node_modules", "@name", "space"), modulePath: "/@name/space", realpath: path.join(realdir, "node_modules", "@name", "space")}),
    new Module({name: "scopechild", path: path.join(testdir, "node_modules", "@name", "space", "node_modules", "scopechild"), modulePath: "/@name/space/scopechild", realpath: path.join(realdir, "node_modules", "@name", "space", "node_modules", "scopechild")}),
    new Module({name: "empty", path: path.join(testdir, "node_modules", "empty"), modulePath: "/empty", realpath: path.join(realdir, "node_modules", "empty")}),
    new Module({name: "hasdeps", path: path.join(testdir, "node_modules", "hasdeps"), modulePath: "/hasdeps", realpath: path.join(realdir, "node_modules", "hasdeps")}),
    new Module({name: "deep", path: path.join(testdir, "node_modules", "hasdeps", "node_modules", "deep"), modulePath: "/hasdeps/deep", realpath: path.join(realdir, "node_modules", "hasdeps", "node_modules", "deep")}),
    new Module({name: "plain", path: path.join(testdir, "node_modules", "hasdeps", "node_modules", "plain"), modulePath: "/hasdeps/plain", realpath: path.join(realdir, "node_modules", "plain")}),
    new Module({name: "plain", path: path.join(testdir, "node_modules", "plain"), modulePath: "/plain", realpath: path.join(realdir, "node_modules", "plain")})
  ]
  t.done()
})


test('basic', function (t) {
  const tree = readModuleTree(testdir)
  t.is(tree.length, expected.length, 'tree-read got right number of modules')
  for (let ii in expected) {
    t.isDeeply(tree[ii], expected[ii], `module ${ii} is expected`)
  }
  t.done()
})

test('cleanup', function (t) {
  fixture.remove(testdir)
  t.done()
})
