/*
  tasks.js
  ===========
  defaults wraps generate-assets, watch and server
*/

const gulp = require('gulp')
const runSequence = require('run-sequence')

gulp.task('default', function (done) {
  runSequence('generate-assets',
    'watch',
    'server', done)
})

gulp.task('generate-assets', function (done) {
  runSequence('clean',
    'sass',
    'copy-assets',
    'sass-documentation',
    'copy-assets-documentation',
    'sass-v6',
    'copy-assets-v6', done)
})

gulp.task('watch', function (done) {
  runSequence('watch-sass',
    'watch-assets',
    'watch-sass-v6',
    'watch-assets-v6', done)
})
