'use strict'
module.exports = Module

const path = require('path')

function Module (opts) {
  if (this == null) return new Module(opts)
  this.name = opts.name
  this.path = opts.path
  this.realpath = opts.realpath == null ? null : opts.realpath
  this.modulepath = opts.modulePath
  this.isLink = path.resolve(opts.path) !== opts.realpath
  this.error = opts.error
}

