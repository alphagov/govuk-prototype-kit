const { splitSemverVersion } = require('./index')
const argv = require('./argv-parser').parse(process.argv)

const verboseLogger = !argv.options.verbose
  ? () => {}
  : function () {
    console.log('[verbose]', ...arguments)
  }
const progressLogger = function () {
  if (argv.command === 'init') {
    const versionOfInstaller = argv.options['created-from-version']
    if (!versionOfInstaller) {
      return
    }
    const version = splitSemverVersion(versionOfInstaller)
    if (version.major === 13 && version.minor < 2) {
      return
    }
  }

  console.log(' - ', ...arguments)
}

module.exports = {
  verboseLogger,
  progressLogger
}
