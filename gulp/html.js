
const gulp = require('gulp')

const config = require('./config.json')

gulp.task('html', function () {
  return gulp.src(config.paths.views + '/**/*.html')
  .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-govuk-template-assets', function () {
  return gulp.src(config.paths.govukModules + '/govuk_template/assets/**')
  .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-govuk-frontend-images', function () {
  return gulp.src(config.paths.govukModules + '/govuk_frontend_toolkit/images/**')
  .pipe(gulp.dest(config.paths.public + '/images'))
})

gulp.task('copy-govuk-frontend-javascripts', function () {
  return gulp.src(config.paths.govukModules + '/govuk_frontend_toolkit/javascripts/**')
  .pipe(gulp.dest(config.paths.public + '/javascripts'))
})

gulp.task('copy-govuk-assets', [
  'copy-govuk-template-assets',
  'copy-govuk-frontend-images',
  'copy-govuk-frontend-javascripts'
])