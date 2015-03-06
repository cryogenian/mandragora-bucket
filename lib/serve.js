var express = require("express"),
    gulp = require("gulp"),
    http = require("http"),
    ecstatic = require("ecstatic");

module.exports = function(taskName, serverPort, subdirectory) {
    if (taskName === undefined) {
        taskName = "serve";
    }
    if (serverPort === undefined) {
        serverPort = 5050;
    }
    if (subdirectory === undefined) {
        subdirectory = "public";
    }
    var app = express();
    app.use(express.static('./' + subdirectory));
    app.use("/lib", express.static('./bower_components'));

    return function() {
        app.listen(serverPort);
    };
};
