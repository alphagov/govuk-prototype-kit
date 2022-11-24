
const { spawn } = require('../../lib/exec')

const packageJsonFormat = { encoding: 'utf8', spaces: 2 }

async function npmInstall (cwd, dependencies) {
  return spawn(
    'npm', [
      'install',
      '--no-audit',
      '--loglevel=error',
      '--omit=dev',
      ...dependencies
    ], {
      cwd: cwd,
      shell: true,
      stdio: 'inherit'
    })
}

module.exports = {
  npmInstall,
  packageJsonFormat
}
