'use strict'
module.exports = readdir
module.exports.sync = readdirSync

const fs = require('fs')
const path = require('path')
let Bluebird
let fsReaddir

function readdir (dir) {
  if (!Bluebird) Bluebird = require('bluebird')
  if (!fsReaddir) fsReaddir = Bluebird.promisify(fs.readdir)
  const kids = []
  return fsReaddir(dir).then(listing => listing.sort()).each(kid => {
    if (kid.charAt(0) === '@') {
      const scopedir = path.resolve(dir, kid)
      return fsReaddir(scopedir).then(scopelisting => scopelisting.sort()).map(scopekid => {
        return kid + '/' + scopekid
      }).then(scopekids => kids.push.apply(kids, scopekids))
    } else {
      kids.push(kid)
    }
  }).thenReturn(kids)
}

function readdirSync (dir) {
  const kids = []
  const listing = fs.readdirSync(dir).sort()

  for (let kid of listing) {
    if (kid.charAt(0) === '@') {
      const scopedir = path.resolve(dir, kid)
      var scopekids = fs.readdirSync(scopedir).sort().map(function (scopekid) {
        return kid + '/' + scopekid
      })
      kids.push.apply(kids, scopekids)
    } else {
      kids.push(kid)
    }
  }
  return kids
}
