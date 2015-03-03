module.exports = {
    paths:  {
        src: ["src/**/*.purs"],
        bower: [
            "bower_components/purescript-*/src/**/*.purs",
            "bower_components/purescript-*/src/**/*.purs.hs"
        ],
        concat: [],
        dest: {
            out: {
                build: "build.js",
                test: "testBundle.js",
                concated: "concated.js"
            },
            public: "public",
            dist: "dist",
            npm: "node_modules",
            entry: {
                build: "dist/main.js",
                test: "dist/test.js"
            }
        },
        docs: {
            dest: "MODULES.md",
            src: ["src/**/*.purs"]
        },
        test: ["text/**/*.purs"]
    },
    names: {
        serve: "serve",
        baseRunner: "base-runner",
        testRunner: "test-runner",
        runner: "runner",
        docs: "docs",
        psci: "psci",
        copyNpm: "copy-node-modules",
        makeProd: "make-prod",
        makeDev: "make-dev",
        bundleDev: "bundle-dev",
        bundleProd: "bundle-prod",
        bundleTest: "bundle-test",
        karma: "karma",
        karmaWatch: "karma-watch",
        cover: "cover",
        concatBuild: "concat-build",
        testDev: "test-dev",
        test: "test",
        prod: "prod",
        compileDev: "compile-dev",
        watchDev: "watch-dev",
        watchTest: "watch-test",
        dev: "dev",
        tdd: "tdd"
    }
};
