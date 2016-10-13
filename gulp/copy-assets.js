/*
  copy.js
  ===========
  copies images and javascript folders to public
*/

var gulp = require('gulp')
var config = require('./config.json')

gulp.task('copy-assets', function () {
  return gulp.src(['!' + config.assets.base + 'sass{,/**/*}', config.assets.base + '/**'])
  .pipe(gulp.dest(config.assets.output))
})
