'use strict'
const test = require('tap').test
const Bluebird = require('bluebird')
const readModuleTreeAsync = require('../index.js').async
const readModuleTreeSync = require('../index.js')
const Module = readModuleTreeSync.Module
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
      }),
      cycle: Dir({
        node_modules: Dir({
          cycle: Symlink('/node_modules/cycle')
        })
      }),
      broken: Symlink('/to/nowhere'),
      bad_nm: Dir({
        node_modules: File('')
      })
    })
  })
)

function tp () {
  const args = [].slice.call(arguments)
  let result = args.shift()
  for (let dir of args) {
    result = path.resolve(result, 'node_modules', dir)
  }
  return result
}

let generalExpected
let scopedExpected

test('setup', function (t) {
  fixture.remove(testdir)
  fixture.create(testdir)
  const realdir = realpath(testdir)
  generalExpected = [
    new Module({name: path.basename(__filename, '.js'), path: testdir, modulePath: '/', realpath: realdir}),
    new Module({name: '@name/space', path: tp(testdir, '@name/space'), modulePath: '/@name/space', realpath: tp(realdir, '@name/space')}),
    new Module({name: 'scopechild', path: tp(testdir, '@name/space', 'scopechild'), modulePath: '/@name/space/scopechild', realpath: tp(realdir, '@name/space', 'scopechild')}),
    new Module({name: 'bad_nm', path: tp(testdir, 'bad_nm'), modulePath: '/bad_nm', realpath: tp(realdir, 'bad_nm'), error: 'ENOTDIR'}),
    new Module({name: 'broken', path: tp(testdir, 'broken'), modulePath: '/broken', realpath: null, error: 'ENOENT'}),
    new Module({name: 'cycle', path: tp(testdir, 'cycle'), modulePath: '/cycle', realpath: tp(realdir, 'cycle')}),
    new Module({name: 'cycle', path: tp(testdir, 'cycle', 'cycle'), modulePath: '/cycle/cycle', realpath: tp(realdir, 'cycle'), error: 'EMODULECYCLE'}),
    new Module({name: 'empty', path: tp(testdir, 'empty'), modulePath: '/empty', realpath: tp(realdir, 'empty')}),
    new Module({name: 'hasdeps', path: tp(testdir, 'hasdeps'), modulePath: '/hasdeps', realpath: tp(realdir, 'hasdeps')}),
    new Module({name: 'deep', path: tp(testdir, 'hasdeps', 'deep'), modulePath: '/hasdeps/deep', realpath: tp(realdir, 'hasdeps', 'deep')}),
    new Module({name: 'plain', path: tp(testdir, 'hasdeps', 'plain'), modulePath: '/hasdeps/plain', realpath: tp(realdir, 'plain')}),
    new Module({name: 'plain', path: tp(testdir, 'plain'), modulePath: '/plain', realpath: tp(realdir, 'plain')})
  ]
  scopedExpected = [
    new Module({name: '@name/space', path: tp(testdir, '@name/space'), modulePath: '/', realpath: tp(realdir, '@name/space')}),
    new Module({name: 'scopechild', path: tp(testdir, '@name/space', 'scopechild'), modulePath: '/scopechild', realpath: tp(realdir, '@name/space', 'scopechild')})
  ]
  t.done()
})

function areTreesTheSame (t, actualTree, expectedTree, label) {
  t.is(actualTree.length, expectedTree.length, `${label}: got right number of modules`)
  for (let ii in expectedTree) {
    actualTree[ii].children = []
    actualTree[ii].parent = undefined
    if (expectedTree[ii].error && actualTree[ii].error) actualTree[ii].error = actualTree[ii].error.code || true
    t.isDeeply(actualTree[ii], expectedTree[ii], `${label}: module ${expectedTree[ii].name} (${ii}) is as expected`)
  }
}

test('functional', function (t) {
  return Bluebird.all([
    areTreesTheSame(t, readModuleTreeSync(testdir), generalExpected, 'basic sync'),
    areTreesTheSame(t, readModuleTreeSync(tp(testdir, '@name/space')), scopedExpected, 'scoped sync'),
    readModuleTreeAsync(testdir).then(generalTree => {
      areTreesTheSame(t, generalTree, generalExpected, 'basic async')
    }),
    readModuleTreeAsync(tp(testdir, '@name/space')).then(scopedTree => {
      areTreesTheSame(t, scopedTree, scopedExpected, 'scoped async')
    })
  ]).finally(t.done)
})

test('cleanup', function (t) {
  fixture.remove(testdir)
  t.done()
})
