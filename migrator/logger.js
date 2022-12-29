
// core dependencies
const fs = require('fs').promises
const os = require('os')
const path = require('path')

// local dependencies
const { projectDir } = require('../lib/utils/paths')

const packageVersion = require('../package.json').version

const migrateLogFilePath = path.join(projectDir, 'migrate.log')
let migrateLogFileHandle

function sanitisePaths (str) {
  return str.replaceAll(os.homedir(), '~')
}

async function setup () {
  if (!migrateLogFileHandle) {
    migrateLogFileHandle = await fs.open(migrateLogFilePath, 'a')

    // log some information useful for debugging
    await module.exports.log(new Date().toISOString())
    await module.exports.log('cwd: ' + sanitisePaths(process.cwd()))
    await module.exports.log(`package: govuk-prototype-kit@${packageVersion}`)
    await module.exports.log('argv: ' + sanitisePaths(process.argv.join(' ')))
  }
}

async function teardown () {
  if (migrateLogFileHandle) {
    await migrateLogFileHandle.close()
  }
}

async function log (message) {
  await migrateLogFileHandle.write(message + '\n')
}

module.exports = {
  log,
  sanitisePaths,
  setup,
  teardown
}
