'use strict'
module.exports = rpjAsync

const fs = require('fs')
const normalizeData = require('normalize-package-data')
const Bluebird = require('Bluebird')
const fsReadFileAsync = Bluebird.promisify(fs.readFile)
const globAsync = Bluebird.promisify(require('glob'))
const common = require('./rpj-common.js')

function rpjAsync (file) {
  let pj
  return fsReadFileAsync(file).then(data => {
    pj = common.json(data)
    const todo = []
    bins(file, pj, todo)
    gypfile(file, pj, todo)
    if (todo.length) return Bluebird.all(todo)
  }).then(() => {
    normalizeData(pj, null, false)
    return pj
  })
}

function bins (file, pj, todo) {
  if (Array.isArray(pj.bin)) {
    return common.bins(pj, pj.bin)
  } else if (pj.bin) {
    return
  } else {
    const bindir = pj.directories && pj.directories.bin
    if (!bindir) return

    const binpath = path.resolve(path.dirname(file), bindir)
    todo.push(globAsync('**', { cwd: binpath }).then(files => common.bins(pj, files)))
  }
}

function gypfile (file, pj, todo) {
  const scripts = pj.scripts || {}
  if (scripts.install || scripts.preinstall) return

  const pkgroot = path.dirname(file)
  todo.push(globAsync('*.gyp', { cwd: pkgroot }).then(files => common.gypfile(pj, files)))
}

function serverjs (file, data, cb) {
  var dir = path.dirname(file)
  var s = data.scripts || {}
  if (s.start) return cb(null, data)
  glob('server.js', { cwd: dir }, function (er, files) {
    if (er) return cb(er)
    serverjs_(file, data, files, cb)
  })
}
