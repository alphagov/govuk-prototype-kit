const path = require('path')
const { projectDir } = require('../path-utils')
const fs = require('fs').promises

const migrateLogFilePath = path.join(projectDir, 'migrate.log')
let migrateLogFileHandle

async function setup () {
  if (!migrateLogFileHandle) {
    migrateLogFileHandle = await fs.open(migrateLogFilePath, 'a')
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
