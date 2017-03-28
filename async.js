'use strict'
const path = require('path')
let Bluebird
let realpath
const readdir = require('./readdir.js')
const Module = require('./module.js')
const validate = require('aproba')

module.exports = readModuleTree
module.exports.Module = Module

function readModuleTree (dir, opts) {
  validate('SO|SZ', [dir, opts])
  if (!Bluebird) Bluebird = require('bluebird')
  if (!realpath) realpath = Bluebird.promisify(require('fs').realpath)
  if (!opts) opts = {}
  const pathbits = path.resolve(dir).split(path.sep)
  let name = pathbits.pop()
  const parentname = pathbits.pop()
  if (parentname && parentname[0] === '@') name = parentname + '/' + name
  const ModuleClass = (opts.ModuleClass) || Module
  const filterWith = opts.filterWith
  return readModulePath({}, ModuleClass, name, dir, '/', filterWith)
}

function readModulePath (seen, ModuleClass, name, dir, modulePath, filterWith, parent) {
  let realdir
  let realdirEr
  return realpath(dir).then(rd => {
    realdir = rd
    if (seen[realdir]) {
      realdirEr = new Error('Cycle detected, ' + seen[realdir] + ' and ' + dir + ' point to ' + realdir)
      realdirEr.code = 'EMODULECYCLE'
      realdirEr.sources = [seen[realdir], dir]
      realdirEr.destination = realdir
    } else {
      seen = Object.create(seen)
      seen[realdir] = dir
    }
  }, error => realdirEr = error).then(() => {
    const mod = new ModuleClass({
      parent: parent,
      name: name,
      path: dir,
      modulePath: modulePath,
      realpath: realdir,
      error: realdirEr
    })
    const result = [mod]
    if (parent) parent.children.push(mod)
    if (realdirEr || mod.isLink) return result

    let files = readdir(path.join(dir, 'node_modules'))
    if (filterWith) {
      files = files.filter(file => filterWith(mod, file))
    }
    return files.each(file => {
      return readModulePath(seen, ModuleClass, file, path.join(dir, 'node_modules', file), path.join(modulePath, file), filterWith, mod).then(files => {
        result.push.apply(result, files)
      })
    }).catch(error => {
      if (error.code !== 'ENOENT' && !mod.error) {
        mod.error = error
      }
    }).thenReturn(result)
  })
}
