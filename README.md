# mandragora-bucket
[![Build Status](https://travis-ci.org/cryogenian/mandragora-bucket.svg?branch=master)](https://travis-ci.org/cryogenian/mandragora-bucket)

## Dependencies 

* nodejs > 0.12
* globally installed gulp

## The purpose

**mandragora-bucket** provides bunch of gulp tasks that covers almost
all needs of **purescript** project.

## It can

* build projects via `psc` or `psc-make`
* bundle `psc-make`d or `psc`ed  projects with **browserify**
* test projects with **karma** and check coverage with **istanbul** 
* manage projects that have multiple entry points.
* watching `psc-make` and `karma` builds
* producing docs

## How to use it

### default directory structure

```
root
  - src/  -- Source code
  - test/ -- Tests code
  - dist/ -- temporary directory
    - node_modules -- symlinks to project node_modules/ and psc-maked src
    - entry-foo.js -- browserify entry one
    - entry-bar.js -- browserify entry two
    - test-main.js -- browserify test entry
  - bower_components/ 
  - node_modules/ 
  - MODULES.md -- generated docs
  - bower.json
  - package.json 
  ```

### default config

```javascript
{
  paths: {
    bower: [
      'bower_components/purescript-*/src/**/*.purs',
      'bower_components/purescript-*/purescript-*/src/**/*.purs'
    ],
    src: ['src/**/*.purs'],
    test: ['test/**/*.purs'],
    docs: {
      dest: 'MODULES.md'
    }
  },
  tmpDir: 'dist'
}
```
* It takes `paths.bower` and `paths.src` to compile and watch in
main tasks.
* It takes `paths.bower`, `paths.src` and `paths.test` for test
tasks.
* `gulp docs` emits documentation to `paths.docs.dest`
* Temporary directory is `tmpDir`

### minimal user config

```javascript
{
    entries: {
        "Main": {
            "name": "build",
            "dir": "public"
        }
    }
}
```

Merging this config with default will add tasks that compile module `Main`,
bundle results (for `psc-make`) and put it to `public` directory.

### multiple entries config

```json
{
    "Entries.File": {
        "name": "file",
        "dir": "public"
    },
    "Entries.Notebook": {
        "name": "notebook",
        "dir": "public"
    }
}
```

This config will add tasks for both `Entries.File` and `Entries.Notebook`.


### using it in **gulpfile**

```javascript
var mandragora = require("mandragora-bucket"),
    gulp = require("gulp");

mandragora.config.entries = {
    "Entry": {
        "name": "result",
        "dir": "out"
    }
};

// use mandragora.config as default

mandragora(gulp);

// or provide config as second argument

mandragora(gulp, {
    paths: {
        bower: ["bower_components/purescript-*/src/**/*.purs"],
        src: ["my/src"],
        test: ["my/test"],
        docs: {dest: "OTHER.md"},
    },
    tmpDir: "tmp",
    entries: {
        "Main": {
            name: "result",
            dir: "out"
        }
    }
});
```

### Produced tasks

Call to `mandragora.define(gulp)` or `mandragor.define(gulp, config)` will produce
following tasks:

* `gulp bundle-test` -- psc-make `Test.Main` entry and cover all file from **src** with istanbul
* `gulp karma` -- run tests in `karma`
* `gulp cover` -- run tests in `karma` and send statictics to `coveralls`
* `gulp watch-test` -- watch test and project sources, recompile it by `gulp bundle-test`

For each of entry in `config.entries` i.e.
```json
{
    "Foo.Bar": {
        "name": "baz",
        "dir": "out"
    }
}
```
suffix will be `foo-bar`
* `gulp make` -- run `psc-make`
* `gulp entries` -- make entry files for **browserify**
* `gulp psci` -- produce `.psci_modules` for sources
* `gulp docs` -- emit docs 
* `gulp prod-suffix` -- run `psc`
* `gulp bundle-suffix` -- bundle this entry 
* `gulp bundle-prod-suffix` -- bundle `psc` result with it **npm** dependencies
* `gulp deploy-suffix` -- compile via `psc-make`, bundle it, move to `entry.dir` as
`entry.name + ".js"`
* `gulp deploy-prod-suffix` -- compile via `psc`, bundle it, move to `entry.dir` as
`entry.name + ".js"`
* `gulp watch-suffix` -- run `gulp deploy-suffix` on source change
* `gulp bundle-prod` -- compile all entries by `psc` and then bundle it


## Notes

* Tasks for testing will cause exception if there is no `Test.Main` module.
* `gulp deploy-prod` should run after `gulp bundle-prod` and move all its results
to target directories. It doesn't.


