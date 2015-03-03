var fs = require("fs");

function indir(dir, run) {
    var loop = function(existence) {
        if (existence) run();
        else {
            try {
                var stats = fs.statSync(dir);
                if (stats.isDirectory()) {
                    loop(true);
                } else {
                    throw new Error("incorrect directory name");
                }
            } catch (e)  {
                try {
                    fs.mkdirSync(dir);
                    loop(true);
                } catch (e) {
                    loop(false);
                }
            }
        }
    };
    return loop(false);
}

function testLauncher(entry, main, modules, distDir) {
    if (distDir === undefined) {
        distDir = "dist";
    }
    if (main === undefined) {
        main = "Main";
    }
    if (modules === undefined) {
        modules = [];
    }
    var run = function() {
        var path = distDir + "/" + entry,
            content = "";

        modules.forEach(function(module) {
            content += "require('" + module + "');\n";
        });
        content += "require('" + main + "').main()";
        fs.writeFileSync(path.content);
    };
    return indir(distDir, run);
}

function mainLauncher(main, entry, distDir) {
    if (entry === undefined) {
        entry = "main.js";
    }
    return testLauncher(entry, main, [], distDir);
}
module.exports = {
    test: testLauncher,
    main: mainLauncher
};
