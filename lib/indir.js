var fs = require("fs");
module.exports = function indir(dir, run) {
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
};
