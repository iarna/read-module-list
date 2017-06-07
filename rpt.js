'use strict'
module.exports = rpt
module.exports.async = rptAsync

const path = require('path')
const validate = require('aproba')
const readModuleList = require('./index.js')
const Bluebird = require('bluebird')
const rpj = require('./rpj.js')
const rpjAsync = require('./rpj-async.js')
const Module = require('./module.js')

class Package extends Module {
  constructor (opts) {
    super(opts)
    if (this.error) return
    try {
      this.package = rpj(path.join(this.path, 'package.json'))
    } catch (ex) {
      this.error = ex
    }
  }
}

class AsyncPackage extends Module {
  constructor (opts) {
    super(opts)
    this.package = null
  }
}

function rpt (root, filterWith) {
  return readModuleList(root, {filterWith: filterWith, ModuleClass: Package})
}

function rptAsync (root, filterWith) {
  return readModuleList.async(root, {filterWith: filterWith, ModuleClass: AsyncPackage}).map(item => {
    if (item.error) return item
    return rpjAsync(path.join(item.path, 'package.json')).then(data => item.package = data, err => item.error = err).thenReturn(item)
  })
}

