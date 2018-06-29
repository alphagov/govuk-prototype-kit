/*
  copy.js
  ===========
  copies images and javascript folders to public
*/

const gulp = require('gulp')
const config = require('./config.json')

gulp.task('copy-assets', function () {
  return gulp.src(['!' + config.paths.assets + 'sass{,/**/*}',
    config.paths.assets + '/**'])
  .pipe(gulp.dest(config.paths.public))
})

// Sass for backward compatibility with Elements
gulp.task('copy-govuk-elements-assets', function () {
  return gulp.src([
    '!lib/backwards-compatibility/govuk-elements/assets/sass{,/**/*}',
    'lib/backwards-compatibility/govuk-elements/assets/**'
  ])
  .pipe(gulp.dest(config.paths.public + '/backwards-compatibility/govuk-elements/'))
})

gulp.task('copy-documentation-assets', function () {
  return gulp.src(['!' + config.paths.docsAssets + 'sass{,/**/*}',
    config.paths.docsAssets + '/**'])
  .pipe(gulp.dest(config.paths.public))
})
