/*
  sass.js
  ===========
  compiles sass from assets folder
  also includes sourcemaps
*/

const gulp = require('gulp')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')

const config = require('./config.json')

gulp.task('sass', function () {
  return gulp.src(config.paths.assets + '/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.public + '/stylesheets/'))
})

gulp.task('sass-documentation', function () {
  return gulp.src(config.paths.docsAssets + '/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.public + '/stylesheets/'))
})

// Backward compatibility with Elements

gulp.task('sass-v6', function () {
  return gulp.src(config.paths.v6Assets + '/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: [
        'node_modules/govuk_frontend_toolkit/stylesheets',
        'node_modules/govuk-elements-sass/public/sass',
        'node_modules/govuk_template_jinja/assets/stylesheets'
      ]
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.public + '/v6/stylesheets/'))
})
