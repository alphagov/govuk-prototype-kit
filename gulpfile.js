/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in `/gulp`. Any files in that directory
  get automatically required below.
  To add a new task, simply add a new task file that directory.
*/

const gulp = require('gulp')
const requireDir = require('require-dir')

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp', { recurse: true })

// gulp 4 requires dependency tasks to be defined before they are called.
// We'll keep our top-level tasks in this file so that they are defined at the end of the chain, after their dependencies.
gulp.task('generate-assets', gulp.series(
  'clean',
  'sass-extensions',
  gulp.parallel(
    'sass',
    'copy-assets',
    'sass-documentation',
    'copy-assets-documentation',
    'sass-v6',
    'copy-assets-v6'
  )
))
gulp.task('watch', gulp.parallel(
  'watch-sass',
  'watch-assets',
  'watch-sass-v6',
  'watch-assets-v6'
))
gulp.task('default', gulp.series(
  'generate-assets',
  gulp.parallel(
    'watch',
    'server'
  )
))
