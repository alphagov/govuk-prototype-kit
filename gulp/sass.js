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
  return gulp.src(config.paths.assets + '/sass/*.scss', { sourcemaps: true })
    .pipe(sass.sync({
      outputStyle: 'expanded',
      quietDeps: true
    }).on('error', function (error) {
      // write a blank application.css to force browser refresh on error
      if (!fs.existsSync(stylesheetDirectory)) {
        fs.mkdirSync(stylesheetDirectory)
      }
      fs.writeFileSync(path.join(stylesheetDirectory, 'application.css'), '')
      console.error('\n', error.messageFormatted, '\n')
      this.emit('end')
    }))
    .pipe(gulp.dest(stylesheetDirectory, { sourcemaps: true }))
})

gulp.task('sass-documentation', function () {
  return gulp.src(config.paths.docsAssets + '/sass/*.scss', { sourcemaps: true })
    .pipe(sass.sync({
      outputStyle: 'expanded',
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(gulp.dest(config.paths.public + '/stylesheets/', { sourcemaps: true }))
})

// Backward compatibility with Elements

gulp.task('sass-v6', function () {
  return gulp.src(config.paths.v6Assets + '/sass/*.scss', { sourcemaps: true })
    .pipe(sass.sync({
      outputStyle: 'expanded',
      includePaths: [
        'node_modules/govuk_frontend_toolkit/stylesheets',
        'node_modules/govuk-elements-sass/public/sass',
        'node_modules/govuk_template_jinja/assets/stylesheets'
      ],
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(gulp.dest(config.paths.public + '/v6/stylesheets/', { sourcemaps: true }))
})
