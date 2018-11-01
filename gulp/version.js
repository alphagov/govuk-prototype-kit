/*
  version.js
  ===========
  generates an incremental hash for cache-busting
*/

const fs = require('fs')
const gulp = require('gulp')
const path = require('path')

gulp.task('version', function (done) {
  const version = (+new Date()).toString(36)
  fs.writeFile(path.resolve('./app/version.txt'), version, done)
})
