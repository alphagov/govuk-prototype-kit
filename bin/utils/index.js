// local dependencies
const { spawn } = require('../../lib/exec')
const fse = require('fs-extra')

const packageJsonFormat = { encoding: 'utf8', spaces: 2 }
const kitPackageAlias = 'govuk-prototype-kit'

async function npmInstall (cwd, dependencies) {
  dependencies.push('--save-exact')
  return spawn(
    'npm', [
      'install',
      ...dependencies
    ], {
      cwd,
      stderr: 'inherit'
    })
    .catch(e => {
      console.error('Failed to install dependencies: ', dependencies.join(', '))
      console.error(e)
      process.exit(0)
    })
}

function splitSemverVersion (version) {
  const versionParts = version.split('.').map(Number)

  return {
    major: versionParts[0],
    minor: versionParts[1],
    patch: versionParts[2]
  }
}

function getKitInstallDependency (publishedPackageName, requestedVersion) {
  const packageHasBeenRenamed = publishedPackageName !== kitPackageAlias
  const packageNameForInstall = packageHasBeenRenamed
    ? `${kitPackageAlias}@npm:${publishedPackageName}`
    : publishedPackageName

  if (!requestedVersion) {
    return packageNameForInstall
  }

  if (requestedVersion === 'local' || requestedVersion === 'local-symlink') {
    return requestedVersion
  }

  if (requestedVersion.match(/\d+\.\d+\.\d+/) ||
    requestedVersion.match(/\d+\.\d+\.\d+-alpha\.\d+]/) ||
    requestedVersion.match(/\d+\.\d+\.\d+-beta\.\d+]/)
  ) {
    return `${packageNameForInstall}@${requestedVersion}`
  }

  return requestedVersion
}

async function getPackageVersionFromPackageJson (packageJsonPath) {
  const version = (await fse.readJson(packageJsonPath)).version
  return splitSemverVersion(version)
}

module.exports = {
  getKitInstallDependency,
  kitPackageAlias,
  npmInstall,
  packageJsonFormat,
  getPackageVersionFromPackageJson,
  splitSemverVersion
}
