var gulp = require('gulp');
var jsValidate = require('gulp-jsvalidate');
 
gulp.task('default', function () {
    return gulp.src(['index.js', 'lib/**/*.js'])
        .pipe(jsValidate());
});
