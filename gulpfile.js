var gulp = require('gulp');
var eslint = require('gulp-eslint');

var raptorSrc = [
  './index.js',
  './lib/**/*.js'
];

gulp.task('lint', function() {
  return gulp.src(raptorSrc)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
