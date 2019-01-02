/*
  clean.js
  ===========
  removes folders:
    - public
*/

const del = require('del')
const gulp = require('gulp')

const config = require('./config.json')

gulp.task('clean', function (done) {
  return del([config.paths.public + '/*',
    '.port.tmp'])
})
