var fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    purescript = require("gulp-purescript"),
    concat = require("gulp-concat"),

    coveralls = require("gulp-coveralls"),
    br = require("browserify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    karma = require("karma").server;


var entryFactory = require("./lib/entry-factory.js"),
    errorHandler = require("./lib/handle-error.js"),
    nameGetter = require("./lib/get-names.js"),
    istanbullify = require("./lib/istanbullify.js"),
    indir = require("./lib/indir.js");


function defineTasks(gulp, config) {
    var paths = config.paths,
        bundleIt = function(entry, target) {
            return function() {
                var bundler = br({
                    entries: [entry]
                });
                var bundle = function() {
                    console.log("!");
                    return bundler
                        .bundle()
                        .pipe(source(target))
                        .pipe(buffer())
                        .pipe(gulp.dest(config.tmpDir));
            };
                return bundle();
            };
        },
        getName = function(key) {
            return key.toLowerCase().replace(".", "-");
        };
    
    gulp.task("entries", function() {
        _(config.entries).mapObject(function(val, key) {
            entryFactory.make(key, config.tmpDir);
        });
        var modules = nameGetter.modules(paths.src);
        entryFactory.make("Test.Main", config.tmpDir, modules);
    });

    gulp.task("docs", function() {
        var docgen = purescript.pscDocs();
        errorHandler(docgen);
        return gulp.src(paths.src)
            .pipe(docgen)
            .pipe(gulp.dest(paths.docs.dest));
    });
    gulp.task("psci", function() {
        gulp.src(
            paths.src.concat(paths.bower).concat(paths.test)
        ).pipe(purescript.dotPsci({}));
    });
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

    gulp.task("make", function() {
        var psc = purescript.pscMake({
            output: config.tmpDir + "/node_modules"
        });
        errorHandler(psc);
        return gulp.src(paths.src.concat(paths.bower).concat(paths.test))
            .pipe(psc);
    });
    

    _(config.entries).mapObject(function(val, key) {
        var name = getName(key);
        gulp.task(
            "prod-" + getName(key),
            function() {
                var psc = purescript.psc({
                    output: getName(key) + "-prod.js",
                    modules: [key],
                    main: key
                });
                errorHandler(psc);
                return gulp.src(paths.src.concat(paths.bower))
                    .pipe(psc)
                    .pipe(gulp.dest(config.tmpDir));
            });
        
        gulp.task(
            "bundle-" +  getName(key),
            ["entries", "make"],
            bundleIt("./" + config.tmpDir + "/" + name + ".js",
                     getName(key) + "-builded.js"));

        gulp.task(
            "bundle-prod-" + getName(key),
            ["entries", "prod-" + getName(key)],
            bundleIt("./" + config.tmpDir + "/" + name + "-prod.js",
                     getName(key) + "-prod-builded.js"));
        
        gulp.task(
            "deploy-" + name,
            ["entries", "bundle-" + name],
            function() {
                gulp.src(["./" + config.tmpDir + "/" + name + "-builded.js"])
                    .pipe(concat(val.name + ".js"))
                    .pipe(gulp.dest(val.dir));
            });
        
        gulp.task(
            "deploy-prod-" + name,
            ["entries", "bundle-prod-" + name],
            function() {
                gulp.src(["./" + config.tmpDir + "/" + name + "-prod.js"])
                    .pipe(concat(val.name + ".js"))
                    .pipe(gulp.dest(val.dir));
            });
        gulp.task(
            "watch-" + name,
            ["deploy-" + name],
            function() {
                gulp.watch(
                    paths.src.concat(paths.test),
                    ["deploy-" + name]
                );
            });

    });

    gulp.task("compile", _(config.entries).map(function(val, key) {
        return "prod-" + getName(key);     
    }));
    
    gulp.task("bundle-prod", ["entries", "compile"], function() {
        _(config.entries).mapObject(function(val, key) {
            bundleIt("./" + config.tmpDir + "/" + getName(key) + "-prod.js",
                     getName(key) + "-prod-builded.js")();
        });
    });

    gulp.task("deploy-prod", ["bundle-prod"], function() {
        _(config.entries).mapObject(function(val, key) {
            gulp.src(["./" + config.tmpDir + "/" + getName(key) + "-prod-builded.js"])
                .pipe(concat(val.name + ".js"))
                .pipe(gulp.dest(val.dir));
        });
    });
    gulp.task("bundle-test", ["entries", "make"], function() {
        var bundler = br({
            entries: ["./" + config.tmpDir + "/" + "test-main.js"]
        });
        var pats = nameGetter.files(
            paths.src,
            config.tmpDir + "/node_modules"
        );
        var bundle = function() {
            return bundler
                .transform(istanbullify(pats), {global: true})
                .bundle()
                .pipe(source("test-main-builded.js"))
                .pipe(buffer())
                .pipe(gulp.dest(config.tmpDir));
        };
        return bundle();
    });

    gulp.task("karma", ["bundle-test"], function(cb) {
        karma.start({
            configFile: __dirname + "/karma.conf.js",
            action: "run",
            singleRun: true
        }, cb);
    });
    gulp.task("cover", ["karma"], function() {
        gulp.src("../../coverage/**/lcov.info")
            .pipe(coveralls());
    });

    
    gulp.task("watch-test", ["bundle-test"], function() {
        gulp.watch(
            paths.src.concat(paths.test),
            ["bundle-test"]
        );
    });
}

module.exports = defineTasks;
