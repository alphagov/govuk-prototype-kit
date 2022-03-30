/*
  sass.js
  ===========
  compiles sass from assets folder
  also includes sourcemaps
*/

const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const path = require('path')
const fs = require('fs')

const extensions = require('../lib/extensions/extensions')
const config = require('./config.json')
const stylesheetDirectory = config.paths.public + 'stylesheets'

gulp.task('sass-extensions', function (done) {
  const fileContents = '$govuk-extensions-url-context: "/extension-assets"; ' + extensions.getFileSystemPaths('sass')
    .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
    .join('\n')
  fs.writeFile(path.join(config.paths.lib + 'extensions', '_extensions.scss'), fileContents, done)
})

gulp.task('sass', function () {
  const deprecationWarningList = {}
  return gulp.src(config.paths.assets + '/sass/*.scss', { sourcemaps: true })
    .pipe(sass.sync({
      outputStyle: 'expanded',
      logger: customLogger(deprecationWarningList)
    }, false).on('error', function (error) {
      // write a blank application.css to force browser refresh on error
      if (!fs.existsSync(stylesheetDirectory)) {
        fs.mkdirSync(stylesheetDirectory)
      }
      fs.writeFileSync(path.join(stylesheetDirectory, 'application.css'), '')
      console.error('\n', error.messageFormatted, '\n')
      this.emit('end')
    }))
    .pipe(gulp.dest(stylesheetDirectory, { sourcemaps: true }))
    .on('end', showDeprecationError(deprecationWarningList))
})

gulp.task('sass-documentation', function () {
  const deprecationWarningList = {}
  return gulp.src(config.paths.docsAssets + '/sass/*.scss', { sourcemaps: true })
    .pipe(sass.sync({
      outputStyle: 'expanded',
      logger: customLogger(deprecationWarningList)
    }).on('error', sass.logError))
    .pipe(gulp.dest(config.paths.public + '/stylesheets/', { sourcemaps: true }))
    .on('end', showDeprecationError(deprecationWarningList))
})

// Backward compatibility with Elements

gulp.task('sass-v6', function () {
  const deprecationWarningList = {}
  return gulp.src(config.paths.v6Assets + '/sass/*.scss', { sourcemaps: true })
    .pipe(sass.sync({
      outputStyle: 'expanded',
      logger: customLogger(deprecationWarningList),
      includePaths: [
        'node_modules/govuk_frontend_toolkit/stylesheets',
        'node_modules/govuk-elements-sass/public/sass',
        'node_modules/govuk_template_jinja/assets/stylesheets'
      ]
    }).on('error', sass.logError))
    .pipe(gulp.dest(config.paths.public + '/v6/stylesheets/', { sourcemaps: true }))
    .on('end', showDeprecationError(deprecationWarningList))
})

// Custom logs to support the Dart Sass transition

function customLogger (warningList) {
  function getFileNameFromMeta (meta) {
    try {
      return meta.span.file.url._uri.replace('file://' + path.resolve(__dirname, '..') + '/', '')
    } catch (e) {
      return ''
    }
  }

  return {
    debug: (debug, meta) => {
      console.log(debug)
      console.log(meta.stack)
    },
    warn: (warning, meta) => {
      if (warning.match(/^[0-9]+ repetitive deprecation warnings omitted\.$/)) {
        return
      }
      if (meta.deprecation === true && warning.includes('More info and automated migrator: https://sass-lang.com/d/slash-div')) {
        const fileName = getFileNameFromMeta(meta)
        const match = fileName.match(/node_modules[/\\]([^/\\]+)/)
        const project = match ? match[1] : fileName
        warningList[project] = warningList[project] || 0
        warningList[project] += 1
      } else {
        const prefix = meta.deprecation ? 'DEPRECATION WARNING: ' : ''
        console.error(`${prefix}${warning}`)
        console.error(meta.stack)
      }
    }
  }
}

function showDeprecationError (warningList) {
  return function () {
    if (Object.keys(warningList).length === 0) {
      return;
    }
    const fmtStart = '\x1b[33m'
    const fmtEnd = '\x1b[0m'
    const em = '\x1b[4m'
    const fmtRestart = `${fmtEnd}${fmtStart}`
    Object.keys(warningList).forEach(project => console.warn(
      `${fmtStart}${em}${project}${fmtRestart} uses a forward slash for division ${em}${warningList[project]} time${warningList[project] ? 's' : ''}${fmtRestart}.${fmtEnd}`))

    console.error([
      fmtStart,
      'This is deprecated as documented at https://sass-lang.com/d/slash-div.',
      'This won\'t cause any problems with your prototype but it would we would encourage them to move to Dart Sass.',
      fmtEnd].join('\n'))
  }
}
