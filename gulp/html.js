
const gulp = require('gulp')

const config = require('./config.json')

gulp.task('html', function () {
  return gulp.src(config.paths.views + '/**/*.html')
  .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-gov-assets', function () {
  return gulp.src(config.paths.govukModules + '/govuk_template/assets/**')
  .pipe(gulp.dest(config.paths.public))
})