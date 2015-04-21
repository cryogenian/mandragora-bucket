var fs = require("fs"),
    indir = require("./indir.js");

function launcher(mainModule, distDir, modules) {
    if (typeof mainModule === 'undefined') {
        throw new Error("error in root maker, please provide entry module");
    }

    if (typeof distDir === 'undefined') {
        throw new Error("error in root maker, please provide target directory");
    }

    if (typeof modules === 'undefined') {
        modules = [];
    }
    var entry = mainModule.replace(".", "-").toLowerCase() + ".js",
        run = function() {
            var path = distDir + "/" + entry,
                content = "";

            modules.forEach(function(module) {
                content += "require('" + module + "');\n";
            });
            content += "require('" + mainModule + "').main();\n";
            fs.writeFileSync(path, content);
        };
    return indir(distDir, run);
}

module.exports = {
    make: launcher
};
