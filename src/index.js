'use strict'
import path from 'path'
import { realpath } from 'fs'
import { Readable } from 'readable-stream'
import readdir from 'readdir-scoped-modules'

export default class ReadModuleTree extends Readable {
  constructor (dir, opts) {
    super({objectMode: true})
    this.queue = [{action: this.readModule, args: [dir, '/']}]
    this.moduleClass = (opts && opts.moduleClass) || Module
  }
  _read (size) {
    if (!this.queue.length) return this.push()
    console.log(size)
    const todo = this.queue.shift()
    todo.action.apply(this, todo.args)
  }
  readModule (dir, modulePath, realdir, realdirEr) {
    if (!realdir && !realdirEr) {
      return realpath(dir, (er, realdir) => {
        return this.readModule(dir, modulePath, realdir, er)
      })
    }
    const mod = new Module(dir, modulePath, realdir, realdirEr)
    this.queue.push({action: this.readDir, args: [dir, modulePath]})
    this.push(mod)
  }
  readDir (dir, modulePath) {
    readdir(path.join(dir, 'node_modules'), (er, files) => {
      if (files) {
        files.forEach((file) => {
          this.queue.push({action: this.readModule, args: [
            path.join(dir, 'node_modules', file), path.join(modulePath, file)]})
        })
      }
      this._read()
    })
  }
}

export class Module {
  constructor (dir, modulePath, realdir, er) {
    this.path = dir
    this.realpath = realdir
    this.modulepath = modulePath
    this.parent = null
    this.isLink = dir === realdir
    this.error = er
  }
}
