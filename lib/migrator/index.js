const logger = require('./logger')

const supportPage = 'https://prototype-kit.service.gov.uk/docs/support'

const {
  preflightChecks,
  migrateConfig,
  prepareAppRoutes,
  prepareSass,
  deleteUnusedFiles,
  deleteUnusedDirectories,
  deleteEmptyDirectories,
  upgradeIfUnchanged,
  deleteIfUnchanged,
  removeOldPatternIncludesFromSassFile
} = require('./migrationSteps')

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
  'gulpfile.js',
  'VERSION.txt',
  'Procfile'
]

const directoriesToDelete = [
  'docs',
  'gulp',
  'lib',
  '__tests__',
  'cypress',
  'internal_docs',
  'scripts',
  'update',
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
  'app/assets/sass/unbranded-ie8.scss',
  'app/assets/sass/unbranded.scss',
  'app/views/includes/breadcrumb_examples.html',
  'app/views/includes/cookie-banner.html',
  'app/views/layout_unbranded.html'
]

const patternsToDeleteIfUnchanged = [
  'app/assets/sass/patterns/_contents-list.scss',
  'app/assets/sass/patterns/_check-your-answers.scss',
  'app/assets/sass/patterns/_mainstream-guide.scss',
  'app/assets/sass/patterns/_pagination.scss',
  'app/assets/sass/patterns/_related-items.scss',
  'app/assets/sass/patterns/_step-by-step-header.scss',
  'app/assets/sass/patterns/_step-by-step-related.scss',
  'app/assets/sass/patterns/_step-by-step-nav.scss',
  'app/assets/sass/patterns/_step-by-step-navigation.scss',
  'app/assets/sass/patterns/_task-list.scss'
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
      // older versions of kit come with a couple of packages out of the box, keep them
      '@govuk-prototype-kit/step-by-step@2',
      'jquery@3',
      'notifications-node-client@5'
    ], {
      shell: true,
      stdio: 'inherit'
    })
}

// Special case app/views/layout.html, as it has moved in prototype
// starter files, but we don't want to move for existing users
const upgradeLayoutIfUnchanged = async () => {
  const results = await upgradeIfUnchanged(
    ['app/views/layout.html'],
    'app/views/layouts/main.html',
    () => deleteIfUnchanged([
      'app/views/includes/head.html',
      'app/views/includes/scripts.html'
    ]))
  return results.flat()
}

const migrate = async () => {
  await logger.setup()

  let success = false

  try {
    const [...partOneResults] = await Promise.all([
      migrateConfig('app/config.js'),
      prepareAppRoutes('app/routes.js'),
      prepareSass('app/assets/sass/application.scss'),
      deleteUnusedFiles(filesToDelete),
      deleteUnusedDirectories(directoriesToDelete),
      upgradeIfUnchanged(filesToUpdateIfUnchanged),
      upgradeLayoutIfUnchanged(),
      deleteIfUnchanged(filesToDeleteIfUnchanged),
      deleteIfUnchanged(patternsToDeleteIfUnchanged)
    ])

    const [...partTwoResults] = await Promise.all([
      await removeOldPatternIncludesFromSassFile(patternsToDeleteIfUnchanged, 'app/assets/sass/application.scss'),
      await deleteEmptyDirectories(directoriesToDeleteIfEmpty)
    ])

    const results = [...partOneResults, ...partTwoResults].flat()

    const failure = results.some(result => !result)

    if (failure) {
      console.log('\nThe script is unable to fully migrate your prototype to version 13.')
      console.log('\nContact the GOV.UK Prototype team for support.')
      console.log(`\n${supportPage}\n`)
    } else {
      console.log('\nYour prototype has migrated to version 13. To run it, use:')
      console.log('\n`npm run dev`\n')
      console.log('\nIf you have any issues contact the GOV.UK Prototype team.')
      console.log(`\n${supportPage}\n`)
      success = true
    }
  } catch (e) {
    await logger.log(e.message)
    await logger.log(e.stack)
    console.error(e.message)
    console.error(e.stack)
  }

  await logger.teardown()

  return success
}

const performPreflightChecks = async () => {
  await logger.setup()
  const success = await preflightChecks(
    filesToIdentifyPreV13Prototype,
    folderToIdentifyV6Prototype,
    minimumPrototypeVersionForMigration
  )
  if (!success) {
    console.log('\nThe script is unable to migrate your prototype to version 13.')
    console.log('\nContact the GOV.UK Prototype team for support.')
    console.log(`\n${supportPage}\n`)
  }
  await logger.teardown()
  return success
}

module.exports = {
  prepareMigration,
  preflightChecks: performPreflightChecks,
  migrate
}
