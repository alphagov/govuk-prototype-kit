/*
  tasks.js
  ===========
  defaults wraps generate-assets, watch and server
*/

var gulp = require('gulp')
var gutil = require('gulp-util')
var runSequence = require('run-sequence')

gulp.task('default', function (done) {
  runSequence('generate-assets',
                'watch',
                'server', done)
})

gulp.task('generate-assets', function (done) {
  runSequence('clear',
                'copy-govuk-modules',
                'sass',
                'copy-assets', done)
})

gulp.task('copy-govuk-modules', function (done) {
  runSequence(['copy-toolkit',
                'copy-template-assets',
                'copy-elements-sass',
                'copy-template'], done)
})

gulp.task('watch', function (done) {
  runSequence('watch-sass',
               'watch-assets', done)
})

gulp.task('test', function (done) {
  gutil.log('Test that the app runs')
  done()
})
