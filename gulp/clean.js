/*
  clean.js
  ===========
  removes folders:
    - public
*/

const config = require('./config.json')
const del = require('del')
const gulp = require('gulp')

gulp.task('clean', function (done) {
  return del([config.paths.public + '*',
    '.port.tmp'])
})
