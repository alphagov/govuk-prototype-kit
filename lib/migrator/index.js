const {
  deleteDirectoryIfEmpty
} = require('./fileHelpers')

const logger = require('./logger')
const {
  migrateConfig,
  prepareAppRoutes,
  prepareSass,
  deleteUnusedFiles,
  deleteUnusedDirectories,
  upgradeIfUnchanged
} = require('./migrationSteps')

const { addReporter } = require('./reporter')

const filesToDelete = [
  '.port.tmp',
  'listen-on-port.js',
  'server.js',
  'start.js',
  'VERSION.txt',
  'Procfile'
]

const directoriesToDelete = [
  'docs',
  'lib',
  '__tests__',
  'cypress',
  'internal_docs',
  'scripts',
  'update',
  'node_modules',
  'public'
]

const directoriesToDeleteIfEmpty = [
  '/app/assets/sass/patterns',
  '/app/assets/images',
  '/app/views/includes'
]

const filesToUpdateIfUnchanged = [
  'app/assets/javascripts/application.js',
  'app/filters.js'
]

const filesToDeleteIfUnchanged = [
  'app/assets/images/separator-2x.png',
  'app/assets/images/separator.png',
  'app/assets/images/unbranded.ico',
  'app/assets/javascripts/auto-store-data.js',
  'app/assets/javascripts/jquery-1.11.3.js',
  'app/assets/sass/application.scss',
  'app/assets/sass/patterns/_contents-list.scss',
  'app/assets/sass/patterns/_check-your-answers.scss',
  'app/assets/sass/patterns/_mainstream-guide.scss',
  'app/assets/sass/patterns/_pagination.scss',
  'app/assets/sass/patterns/_related-items.scss',
  'app/assets/sass/patterns/_step-by-step-header.scss',
  'app/assets/sass/patterns/_step-by-step-related.scss',
  'app/assets/sass/patterns/_step-by-step-nav.scss',
  'app/assets/sass/patterns/_step-by-step-navigation.scss',
  'app/assets/sass/patterns/_task-list.scss',
  'app/assets/sass/unbranded-ie8.scss',
  'app/assets/sass/unbranded.scss',
  'app/views/includes/breadcrumb_examples.html',
  'app/views/includes/cookie-banner.html',
  'app/views/layout_unbranded.html'
]

const migrate = async () => {
  await logger.setup()

  try {
    await Promise.all([
      migrateConfig('app/config.js'),
      prepareAppRoutes('app/routes.js'),
      prepareSass('app/assets/sass/application.scss'),
      deleteUnusedFiles(filesToDelete),
      deleteUnusedDirectories(directoriesToDelete),
      upgradeIfUnchanged([
        ...filesToUpdateIfUnchanged.map(filePath => ({ filePath, action: 'copyFromKitStarter' })),
        ...filesToDeleteIfUnchanged.map(filePath => ({ filePath, action: 'delete' }))
      ]),
      upgradeIfUnchanged([
        // Special case app/views/layout.html, as it has moved in prototype
        // starter files, but we don't want to move for existing users
        { filePath: 'app/views/layout.html', starterFilePath: 'app/views/layouts/main.html', action: 'copyFromKitStarter' }
      ])
    ])

    await Promise.all(directoriesToDeleteIfEmpty.map(async (dirPath) => {
      const reporter = await addReporter(`Remove empty directory ${dirPath}`)
      const result = await deleteDirectoryIfEmpty(dirPath)
      await reporter(result)
    }))
  } catch (e) {
    await logger.log(e.message)
    await logger.log(e.stack)
    console.error(e.message)
    console.error(e.stack)
  }

  await logger.teardown()
}

module.exports = {
  migrate
}
