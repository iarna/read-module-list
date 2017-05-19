'use strict'
exports.json = json
exports.bins = bins
exports.gypfile = gypfile
exports.serverjs = serverjs

const safeJSON = require('json-parse-helpfulerror')

function stripBOM (content) {
  // utf8 bom
  if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
    return content.slice(3)
  } else {
    return content
  }
}

function json (data) {
  return safeJSON.parse(stripBOM(data))
}

function bins (pj, bins) {
  const bindir = pj.directories && pj.directories.bin
  pj.bin = {}
  for (let binfile of bins) {
    pj.bin[path.basename(binfile)] = path.join(bindir, binfile)
  }
}

function gypfile (pj, files) {
  if (!files.length) return
  if (!pj.scripts) pj.scripts = {}
  pj.scripts.install = 'node-gyp rebuild'
  pj.gypfile = true
}

function serverjs (pj, files) {
  if (!files.length) return
  if (!pj.scripts) pj.scripts = {}
  pj.scripts.start = 'node server.js'
}
