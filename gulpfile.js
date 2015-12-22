var gulp = require('gulp');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var path = require('path');

var raptorLintSrc = [
  './index.js',
  './lib/**/*.js'
];

var raptorBuildSrc = [
  path.join(__dirname, './index.js'),
  path.join(__dirname, './lib/**/*.js'),
  path.join(__dirname, './tests/*.js')
];

var sourceRoot = path.join(__dirname, '.');

gulp.task('lint', function() {
  return gulp.src(raptorLintSrc)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('clean', function() {
  return del([
    'dist/**/*'
  ]);
});

gulp.task('build', ['clean'], function() {
  return gulp.src(raptorBuildSrc, { base: '.' })
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('maps', { sourceRoot: sourceRoot }))
    .pipe(gulp.dest('dist/es5'));
});
