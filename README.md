# read-module-list

Read in the list of all modules (recursively) from your `node_modules` tree.

## USAGE

```
var readModuleList = require('read-module-list')
var through2 = require('through2')
readModuleList('.').forEach(function (module) {
  console.log(module.name)
  console.log(module.path)
  next()
})
```


## EXPORTS

### var readModuleList = require('read-module-list')

### var Module = require('read-module-list').Module
### new Module(opts)

Constructs a new Module object with the following properties. `opts` has the same properties.

* name — The name of the module, including scope if the module is scoped.
* path — The path to the module on disk, as you'd see if you cd'ed into the directory.
* realpath — The path to the module on disk without any symlinks in the path.
* modulepath — A symbolic path representing where this path is in relation
  to other modules.  For the top level module this is `/`, for its children
  '/child` for their children, `/child/grandchild` and so on.
* isLink — True if this module is contained within a symlink.
* error — If there was an error associated with this module, the error is
  stored here.  This can be an error other than ENOENT returned by `readdir`
  or an error returned from `realpath` (for instance, when you have a broken
  symlink).

  this.modulepath = modulePath
  this.isLink = path.resolve(dir) !== realdir
  this.error = er
