/*
  nodemon.js
  ===========
  uses nodemon to run a server, watches for javascript and json changes
*/

const fs = require('fs')
const path = require('path')

const gulp = require('gulp')
const colour = require('ansi-colors')
const log = require('fancy-log')
const nodemon = require('gulp-nodemon')

const config = require('./config.json')

// Warn about npm install on crash
const onCrash = () => {
  log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
}

// Remove .port.tmp if it exists
const onQuit = () => {
  try {
    fs.unlinkSync(path.join(__dirname, '/../.port.tmp'))
  } catch (e) {}

  process.exit(0)
}

gulp.task('server', function () {
  nodemon({
    watch: ['.env', '**/*.js', '**/*.json'],
    script: 'listen-on-port.js',
    ignore: [
      config.paths.public + '*',
      config.paths.assets + '*',
      config.paths.nodeModules + '*'
    ]
  })
    .on('crash', onCrash)
    .on('quit', onQuit)
})
