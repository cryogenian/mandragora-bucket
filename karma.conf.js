module.exports = function(config) {
  config.set({
      browsers: ['PhantomJS'],
      frameworks: ['mocha', 'chai'],
      reporters: ["progress", "coverage"],
      logLevel: config.LOG_INFO,
      files: [
          "../../dist/test-main-builded.js"

      ],
      browserNoActivityTimeout: 300000,
      coverageReporter: {
          dir: "../../coverage",
          subdir: "."
          
          ,reporters: [
              {
                  type: "lcov",
                  subdir: "lcov"
              }
          ]
      }
  });
};
