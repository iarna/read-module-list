# read-module-list

Read in the list of all modules (recursively) from your `node_modules` tree.

## USAGE

```
const readModuleList = require('read-module-list')
readModuleList('.').forEach(function (module) {
  console.log(module.name)
  console.log(module.path)
})
```
```
const readModuleList = require('read-module-list').async
readModuleList('.').each(function (module) {
  console.log(module.name)
  console.log(module.path)
})
```

## EXPORTS

### const readModuleList = require('read-module-list')
### readModuleList(path[, options]) → Array
### readModuleList.async(path[, options]) → Promise[Array]

Return an array of module objects contained in `path`, with the module
`path` as the first entry.

`options` is an optional object with the following properties:

* `filterWith` (optional) — A function accepting `(context, modname)` that
  determines if modules should be added to the output and recursed into.  If
  none is provided then all modules will be included. `context` is the Module object
  whose children we're considering. `modname` is the name of the child we're considering.
* `ModuleClass` (optional) — The class to construct module objects from.  This defaults to
  the `Module` export.

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
* parent — The Module this module was found in.
* children — An array of the children this module contains
