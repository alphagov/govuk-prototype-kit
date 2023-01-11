
// local dependencies
const { spawn } = require('../../lib/exec')

const packageJsonFormat = { encoding: 'utf8', spaces: 2 }

async function npmInstall (cwd, dependencies) {
  return spawn(
    'npm', [
      'install',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      '--omit=dev',
      ...dependencies
    ], {
      cwd,
      stderr: 'inherit'
    })
}

module.exports = {
  npmInstall,
  packageJsonFormat
}
