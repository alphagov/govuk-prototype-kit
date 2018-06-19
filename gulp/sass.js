/*
  sass.js
  ===========
  compiles sass from assets folder with the govuk_modules
  also includes sourcemaps
*/

const gulp = require('gulp')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')

const config = require('./config.json')

gulp.task('sass', function () {
  return gulp.src(config.paths.assets + '/sass/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'expanded',
    includePaths: ['node_modules']}).on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(config.paths.public + '/stylesheets/'))
})

gulp.task('sass-documentation', function () {
  return gulp.src(config.paths.docsAssets + '/sass/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'expanded',
    includePaths: ['node_modules']}).on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(config.paths.public + '/stylesheets/'))
})
