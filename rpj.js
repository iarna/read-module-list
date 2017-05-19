'use strict'

module.exports = rpj

/*
This is a stripped down version of `read-package-json` that _just_ does what
we need for installs and provides sync and async APIs.
*/

const path = require('path')
const fs = require('fs')
const globSync = require('glob').sync
const normalizeData = require('normalize-package-data')
const common = require('./rpj-common.js')

function rpj (file) {
  const pj = common.json(fs.readFileSync(file))
  gypfile(file, pj)
  serverjs(file, pj)
  bins(file, pj)
  normalizeData(pj, null, false)
  return pj
}

function bins (file, pj) {
  if (Array.isArray(pj.bin)) return bins_(pj, pj.bin)

  const bindir = pj.directories && pj.directories.bin
  if (pj.bin || !bindir) return

  bindir = path.resolve(path.dirname(file), bindir)
  common.bins(pj, globSync('**', { cwd: bindir }))
}

function gypfile (file, pj) {
  const scripts = pj.scripts || {}
  if (scripts.install || scripts.preinstall) return

  const pkgroot = path.dirname(file)
  common.gypfile(pj, globSync('*.gyp', { cwd: pkgroot }))
}

function serverjs (file, pj) {
  if (pj.scripts && pj.scripts.start) return

  var pkgroot = path.dirname(file)
  common.serverjs(file, pj, globSync('server.js', { cwd: pkgroot }))
}
