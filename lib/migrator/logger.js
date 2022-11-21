const path = require('path')
const { projectDir } = require('../path-utils')
const fs = require('fs').promises

const packageVersion = require('../../package.json').version

const migrateLogFilePath = path.join(projectDir, 'migrate.log')
let migrateLogFileHandle

async function setup () {
  if (!migrateLogFileHandle) {
    migrateLogFileHandle = await fs.open(migrateLogFilePath, 'a')

    // log some information useful for debugging
    await module.exports.log(new Date().toISOString())
    await module.exports.log('cwd: ' + process.cwd())
    await module.exports.log(`package: govuk-prototype-kit@${packageVersion}`)
    await module.exports.log('argv: ' + process.argv.join(' '))
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
  setup,
  teardown
}
