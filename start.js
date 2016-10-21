'use strict'

const fs = require('fs')
const path = require('path')

if (!fs.existsSync(path.join(__dirname, '/node_modules'))) {
  console.log('node modules are missing, run npm install')
  process.exit(0)
}

const gulp = require('gulp')
const gutil = require('gulp-util')
const chalk = require('chalk')
const prettyTime = require('pretty-hrtime')
require(path.join(__dirname, '/gulpfile.js'))

// we need to set up logging for gulp
// all copied from https://github.com/gulpjs/gulp/blob/master/bin/gulp.js

// Format orchestrator errors
function formatError (e) {
  if (!e.err) {
    return e.message
  }

  // PluginError
  if (typeof e.err.showStack === 'boolean') {
    return e.err.toString()
  }

  // Normal error
  if (e.err.stack) {
    return e.err.stack
  }

  // Unknown (string, number, etc.)
  return new Error(String(e.err)).stack
}

gulp.on('task_start', function (e) {
  // TODO: batch these
  // so when 5 tasks start at once it only logs one time with all 5
  gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...')
})

gulp.on('task_stop', function (e) {
  var time = prettyTime(e.hrDuration)
  gutil.log(
    'Finished', '\'' + chalk.cyan(e.task) + '\'',
    'after', chalk.magenta(time)
  )
})

gulp.on('task_err', function (e) {
  var msg = formatError(e)
  var time = prettyTime(e.hrDuration)
  gutil.log(
    '\'' + chalk.cyan(e.task) + '\'',
    chalk.red('errored after'),
    chalk.magenta(time)
  )
  gutil.log(msg)
})

gulp.on('task_not_found', function (err) {
  gutil.log(
    chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
  )
  gutil.log('Please check the documentation for proper gulpfile formatting')
  process.exit(1)
})

gulp.start('default')
