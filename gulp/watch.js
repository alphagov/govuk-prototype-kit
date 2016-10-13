/*
  watch.js
  ===========
  watches sass/js/images
*/

var gulp = require('gulp')
var config = require('./config.json')

gulp.task('watch-sass', function () {
  return gulp.watch(config.assets.base + 'sass/**', {cwd: './'}, ['sass'])
})

gulp.task('watch-assets', function () {
  return gulp.watch([config.assets.base + 'images/**',
                      config.assets.base + 'javascripts/**'], {cwd: './'}, ['copy'])
})
