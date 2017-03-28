'use strict'
const path = require('path')
const realpath = require('fs').realpathSync
const readdir = require('./readdir.js').sync
const Module = require('./module.js')
const validate = require('aproba')

module.exports = readModuleTree
module.exports.Module = Module

function readModuleTree (dir,  opts) {
  validate('SO|SZ', [dir, opts])
  if (!opts) opts = {}
  const pathbits = path.resolve(dir).split(path.sep)
  let name = pathbits.pop()
  const parentname = pathbits.pop()
  if (parentname && parentname[0] === '@') name = parentname + '/' + name
  const ModuleClass = (opts.ModuleClass) || Module
  const filterWith = opts.filterWith
  return readModulePath({}, ModuleClass, name, dir, '/', filterWith)
}

function realpathFast (dir) {
  try {
    return realpath(dir)
  } catch (ex) {
    return ex
  }
}

function readdirNoErr (dir) {
  try {
    return readdir(dir)
  } catch (ex) {
    return ex
  }
}

function readModulePath (seen, ModuleClass, name, dir, modulePath, filterWith, parent) {
  let realdir = realpathFast(dir)
  let realdirEr
  if (realdir instanceof Error) {
    realdirEr = realdir
    realdir = null
  } else {
    if (seen[realdir]) {
      realdirEr = new Error('Cycle detected, ' + seen[realdir] + ' and ' + dir + ' point to ' + realdir)
      realdirEr.code = 'EMODULECYCLE'
      realdirEr.sources = [seen[realdir], dir]
      realdirEr.destination = realdir
    } else {
      seen = Object.create(seen)
      seen[realdir] = dir
    }
  }
  const mod = new ModuleClass({
    name: name,
    path: dir,
    modulePath: modulePath,
    realpath: realdir,
    error: realdirEr,
    parent: parent
  })
  const result = [mod]
  if (parent) parent.children.push(mod)
  if (realdirEr || mod.isLink) return result

  const filesOrError = readdirNoErr(path.join(dir, 'node_modules'))
  if (filesOrError instanceof Error) {
    const error = filesOrError
    if (error.code !== 'ENOENT' && !mod.error) {
      mod.error = error
    }
  } else {
    let files
    if (filterWith) {
      files = filesOrError.filter(file => filterWith(mod, file))
    } else {
      files = filesOrError
    }

    for (let ii = 0; ii < files.length; ++ii) {
      const file = files[ii]
      result.push.apply(result, readModulePath(seen, ModuleClass, file, path.join(dir, 'node_modules', file), path.join(modulePath, file), filterWith, parent))
    }
  }
  return result
}
