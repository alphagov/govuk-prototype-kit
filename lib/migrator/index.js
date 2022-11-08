const {
  deleteDirectoryIfEmpty
} = require('./fileHelpers')

const logger = require('./logger')
const {
  preflightChecks,
  migrateConfig,
  prepareAppRoutes,
  prepareSass,
  deleteUnusedFiles,
  deleteUnusedDirectories,
  upgradeIfUnchanged
} = require('./migrationSteps')

const { addReporter } = require('./reporter')
const fs = require('fs-extra')
const path = require('path')
const { spawn } = require('../exec')
const { packageJsonFormat } = require('../../bin/utils')
const { projectDir } = require('../path-utils')

const minimumPrototypeVersionForMigration = 8

const folderToIdentifyV6Prototype = path.join(projectDir, 'v6')

const filesToIdentifyPreV13Prototype = [
  'listen-on-port.js',
  'server.js',
  'start.js',
  'VERSION.txt',
  'app/views/layout.html',
  'app/views/index.html'
]

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
  'app/filters.js',
  'app/views/layout.html'
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

const prepareMigration = async (kitDependency, projectDirectory) => {
  await logger.setup()

  await fs.writeJson(path.join(projectDirectory, 'package.json'), {}, packageJsonFormat)

  console.log('Migrating your prototype to v13')

  await spawn(
    'npm', [
      'install',
      '--no-audit',
      '--loglevel', 'error',
      kitDependency,
      'govuk-frontend',
      // older versions of kit came with GOV.UK Notify support, keep it
      'notifications-node-client@5'
    ], {
      shell: true,
      stdio: 'inherit'
    })
}

const migrate = async () => {
  await logger.setup()

  try {
    await Promise.all([
      prepareAppRoutes('app/routes.js'),
      prepareSass('app/assets/sass/application.scss'),
      deleteUnusedFiles(filesToDelete),
      deleteUnusedDirectories(directoriesToDelete),
      upgradeIfUnchanged([
        ...filesToUpdateIfUnchanged.map(filePath => ({ filePath, action: 'copyFromKitStarter' })),
        ...filesToDeleteIfUnchanged.map(filePath => ({ filePath, action: 'delete' }))
      ])
    ])

    await Promise.all(directoriesToDeleteIfEmpty.map(async (dirPath) => {
      const reporter = await addReporter(`Remove empty directory ${dirPath}`)
      const result = await deleteDirectoryIfEmpty(dirPath)
      await reporter(result)
    }))

    // migrate config last so that it will indicate the migration is complete
    await migrateConfig('app/config.js')
  } catch (e) {
    await logger.log(e.message)
    await logger.log(e.stack)
    console.error(e.message)
    console.error(e.stack)
  }

  await logger.teardown()
}

module.exports = {
  prepareMigration,
  preflightChecks: async () => {
    await logger.setup()
    return preflightChecks(
      filesToIdentifyPreV13Prototype,
      folderToIdentifyV6Prototype,
      minimumPrototypeVersionForMigration
    )
  },
  migrate
}
