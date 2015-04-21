var fs = require("fs"),
  child_process = require("child_process"),
  path = require("path"),
  _ = require("underscore"),
  purescript = require("gulp-purescript"),
  concat = require("gulp-concat"),
  plumber = require("gulp-plumber"),

  coveralls = require("gulp-coveralls"),
  browserify = require("browserify"),
  source = require("vinyl-source-stream"),
  buffer = require("vinyl-buffer"),
  karma = require("karma").server,

  entryFactory = require("./lib/entry-factory.js"),
  nameGetter = require("./lib/get-names.js"),
  istanbullify = require("./lib/istanbullify.js"),
  indir = require("./lib/indir.js");

function defineTasks(gulp, config) {
  if (process.platform === "darwin") {
    child_process.execSync("ulimit -n 2560");
  }
  if (typeof config === 'undefined') {
    config = defineTasks.config;
  }

  var paths = config.paths;

  var getName = function (key) {
    return key.toLowerCase().replace(".", "-");
  };

  var bundleIt = function(entry, target) {
    return function() {
      return browserify({ entries: [entry] })
        .bundle()
        .pipe(plumber())
        .pipe(source(target))
        .pipe(buffer())
        .pipe(gulp.dest(config.tmpDir));
    };
  };

  gulp.task("link", function() {
    var stats = fs.lstatSync("./" + config.tmpDir + "/node_modules");
    if (stats.isSymbolicLink()) return;
    else {
      indir(config.tmpDir, function() {
        fs.symlinkSync(path.resolve("./node_modules"),
                 path.resolve("./" + config.tmpDir + "/node_modules"));
      });
    }
  });

  gulp.task("entry-test", function() {
    return entryFactory.make("Test.Main", config.tmpDir, nameGetter.modules(paths.src));
  });

  gulp.task("bundle-test", ["entries", "make"], function() {
    var pats = nameGetter.files(
      paths.src,
      config.tmpDir + "/node_modules"
    );
    return browserify({ entries: ["./" + config.tmpDir + "/" + "test-main.js"] })
      .transform(istanbullify(pats), { global: true })
      .bundle()
      .pipe(plumber())
      .pipe(source("test-main-builded.js"))
      .pipe(buffer())
      .pipe(gulp.dest(config.tmpDir));
  });

  _.each(config.entries, function(val, key) {
    var name = getName(key);

    gulp.task("entry-" + name, function() {
      return entryFactory.make(key, config.tmpDir);
    });

    gulp.task("prod-" + name, function() {
      return gulp.src(_.flatten([paths.src, paths.bower]))
        .pipe(plumber())
        .pipe(purescript.psc({
          output: name + "-prod.js",
          modules: [key],
          main: key
        }))
        .pipe(gulp.dest(config.tmpDir));
    });

    gulp.task("bundle-" + name,
      ["entry-" + name, "make"],
      bundleIt("./" + config.tmpDir + "/" + name + ".js", name + "-builded.js"));

    gulp.task("bundle-prod-" + name,
      ["entry-" + name, "prod-" + name],
      bundleIt("./" + config.tmpDir + "/" + name + "-prod.js", name + "-prod-builded.js"));

    gulp.task("deploy-" + name,
      ["entry-" + name, "bundle-" + name],
      function() {
        return gulp.src(["./" + config.tmpDir + "/" + name + "-builded.js"])
          .pipe(plumber())
          .pipe(concat(val.name + ".js"))
          .pipe(gulp.dest(val.dir));
      });

    gulp.task("deploy-prod-" + name,
      ["bundle-prod-" + name],
      function() {
        console.log("fuoy", name);
        return gulp.src(["./" + config.tmpDir + "/" + name + "-prod.js"])
          .pipe(plumber())
          .pipe(concat(val.name + ".js"))
          .pipe(gulp.dest(val.dir));
      });

    gulp.task("watch-" + name,
      ["deploy-" + name],
      function() {
        gulp.watch(_.flatten([paths.src, paths.test]), ["deploy-" + name]);
      });

  });

  var entryNames = _.keys(config.entries).map(getName);

  gulp.task("make", function() {
    return gulp.src(_.flatten([paths.src, paths.bower, paths.test]))
      .pipe(plumber())
      .pipe(purescript.pscMake({
        output: config.tmpDir + "/node_modules"
      }));
  });

  gulp.task("entries", ["entry-test"].concat(entryNames.map(function (name) {
    return "entry-" + name;
  })));

  gulp.task("psci", function() {
    return gulp.src(_.flatten([paths.src, paths.bower, paths.test]))
      .pipe(plumber())
      .pipe(purescript.dotPsci({}));
  });

  gulp.task("docs", function() {
    return gulp.src(paths.src)
      .pipe(plumber())
      .pipe(purescript.pscDocs())
      .pipe(gulp.dest(paths.docs.dest));
  });

  gulp.task("prod", entryNames.map(function (name) {
    return "prod-" + name;
  }));

  gulp.task("bundle-", entryNames.map(function (name) {
    return "bundle-" + name;
  }));

  gulp.task("bundle-prod", entryNames.map(function (name) {
    return "bundle-prod-" + name;
  }));

  gulp.task("deploy", entryNames.map(function (name) {
    return "deploy-" + name;
  }));

  gulp.task("deploy-prod", entryNames.map(function (name) {
    return "deploy-prod-" + name;
  }));

  gulp.task("karma", ["bundle-test"], function(cb) {
    karma.start({
      configFile: __dirname + "/karma.conf.js",
      action: "run",
      singleRun: true
    }, cb);
  });

  gulp.task("cover", ["karma"], function() {
    gulp.src("../../coverage/**/lcov.info")
      .pipe(plumber())
      .pipe(coveralls());
  });

  gulp.task("watch-test", ["bundle-test"], function() {
    gulp.watch(_.flatten([paths.src, paths.test]), ["bundle-test"]);
  });
}

var defaultConfig = {
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
};

module.exports = defineTasks;
module.exports.config = defaultConfig;
