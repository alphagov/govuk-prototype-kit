/*
  clear.js
  ===========
  removes public folder/govuk_modules folder
*/
var config = require('./config.json')

var gulp = require('gulp')
var clean = require('gulp-clean')

gulp.task('clear', function () {
  return gulp.src([config.assets.output + '/*',
                    config.assets.govuk_modules + '/*'], {read: false})
  .pipe(clean())
})
