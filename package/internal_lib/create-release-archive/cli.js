const path = require('path')

const { repoDir, isNewVersionSync, getReleaseVersionSync } = require('./util')

const { createReleaseArchive } = require('./index')

function usage () {
  console.log(`
Usage:
    scripts/create-release-archive [options]

Options
    -h, --help

Options (advanced):
    --destDir DIR
    --releaseName NAME
  `)
}

function parseArgs (args) {
  const argv = { _: [] }
  for (var i = 0; i < args.length; i++) {
    var arg = args[i]

    if (arg === '-h' || arg === '--help') {
      argv.help = true
    } else if (arg === '--destDir') {
      i++
      argv.dest = args[i]
    } else if (arg === '--releaseName') {
      i++
      argv.releaseName = args[i]
    } else if (arg === '--archiveType') {
      i++
      argv.archiveType = args[i]
    } else {
      argv._.push(arg)
    }
  }
  return argv
}

async function cli () {
  const argv = parseArgs(process.argv.slice(2))

  if (argv.help) {
    usage()
    process.exitCode = 0
    return
  }

  if (argv._.length) {
    usage()
    process.exitCode = 2
    return
  }

  const destDir = argv.dest || repoDir // default to project root
  const ref = 'HEAD'
  const releaseName = argv.releaseName || getReleaseVersionSync(ref)
  const newVersion = !argv.releaseName && isNewVersionSync(releaseName) ? 'new version' : 'version'
  const archiveType = argv.archiveType || 'zip'

  console.log(`Creating release archive for ${newVersion} ${releaseName}`)

  const releaseArchive = await createReleaseArchive(
    { archiveType, destDir, releaseName, verbose: true })

  // insert a blank line for niceness
  console.log()
  console.log(`Saved release archive to ${path.join(argv.dest ? argv.dest : '', releaseArchive)}`)
}

module.exports = {
  cli
}
