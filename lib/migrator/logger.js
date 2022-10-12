const path = require('path')
const { projectDir } = require('../path-utils')
const fs = require('fs').promises

const migrateLogFile = path.join(projectDir, 'migrate.log')
let migrateLogFileHandle

async function log (message) {
  if (!migrateLogFileHandle) {
    migrateLogFileHandle = await fs.open(migrateLogFile, 'w+')
  }
  await migrateLogFileHandle.write(message + '\n')
}

module.exports = {
  log
}
