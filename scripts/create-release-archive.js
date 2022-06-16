#!/usr/bin/env node

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const os = require('os')
const path = require('path')

const packageJsonScriptsInclude = [
  'start',
  'build',
  'serve'
]
const repoDir = path.join(__dirname, '..')

function usage () {
  console.log(`
Usage:
    scripts/create-release-archive [options] [REF]

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
    } else {
      argv._.push(arg)
    }
  }
  return argv
}

function cli () {
  const argv = parseArgs(process.argv.slice(2))

  if (argv.help) {
    usage()
    process.exitCode = 0
    return
  }

  if (argv._.length > 1) {
    usage()
    process.exitCode = 2
    return
  }

  if (argv.dest) {
    fs.mkdirSync(argv.dest, { recursive: true })
  }

  const ref = argv.ref || 'HEAD'
  const version = argv.releaseName || getReleaseVersion(argv.ref)
  const newVersion = !argv.releaseName && isNewVersion(version) ? 'new version' : 'version'

  console.log(`Creating release archive for ${newVersion} ${version}`)

  const name = `govuk-prototype-kit-${version}`
  const releaseArchive = `${name}.zip`

  const repoDir = path.resolve(__dirname, '..')
  const workdir = fs.mkdtempSync(
    path.join(os.tmpdir(), `govuk-prototype-kit--release-${version}`)
  )

  console.log(workdir)

  copyReleaseFiles(repoDir, workdir, { prefix: name, ref: ref })

  // Make the changes we want to make
  // Currently just removing dev stuff from package.json
  console.log('Updating package.json')
  updatePackageJson(path.join(workdir, name, 'package.json'), cleanPackageJson)

  // Create the release archive in the project root (or destDir)
  zipReleaseFiles({
    cwd: workdir, file: path.join(argv.dest || repoDir, releaseArchive), prefix: name
  })

  console.log(`Saved release archive to ${argv.dest ? argv.dest : ''}${releaseArchive}`)

  // Clean up
  fs.rmdirSync(workdir, { recursive: true })
}

function updatePackageJson (file, updater) {
  let pkg
  pkg = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }))
  pkg = updater(pkg)
  const formattedJson = JSON.stringify(pkg, null, 2).replace(/\n/g, os.EOL) + os.EOL
  fs.writeFileSync(file, formattedJson, { encoding: 'utf8' })
  // update package-lock.json to match
  child_process.execSync('npm install', { cwd: path.dirname(file), encoding: 'utf8', stdio: 'inherit' })
}

function cleanPackageJson (pkg) {
  // remove dev dependencies
  delete pkg.devDependencies

  // remove config for dev dependencies
  delete pkg.jest
  delete pkg.standard

  // remove dev scripts
  pkg.scripts = Object.fromEntries(
    Object.entries(pkg.scripts)
      .filter(([name]) => packageJsonScriptsInclude.includes(name))
  )

  return pkg
}

function getReleaseVersion (ref) {
  if (!ref) {
    const packageVersion = JSON.parse(
      fs.readFileSync(path.join(repoDir, 'package.json'), { encoding: 'utf8' })
    ).version
    if (isNewVersion(packageVersion)) {
      return packageVersion
    }
  }

  ref = ref || 'HEAD'

  const versionString = child_process.execSync(`git describe --tags ${ref}`, { encoding: 'utf8' }).trim()
  const version = versionString.slice(1) // drop the initial 'v'

  return version
}

function isNewVersion (version) {
  return !!child_process.spawnSync(
    'git', ['rev-parse', `v${version}`]
  ).status
}

function copyReleaseFiles (src, dest, { prefix, ref }) {
  // We are currently using the export-ignore directives in .gitattributes to
  // decide which files to include in the release archive, so the easiest way
  // to copy all the release files is `git archive`
  child_process.execSync(
    `git archive --format=tar --prefix="${prefix}/" ${ref} | tar -C ${dest} -xf -`,
    { cwd: src }
  )
}

function zipReleaseFiles ({ cwd, file, prefix }) {
  zipCreate(
    {
      cwd: cwd,
      file: file,
      exclude: path.join(prefix, 'node_modules', '*')
    },
    prefix
  )
}

function zipCreate ({ cwd, file, exclude }, files) {
  files = Array.isArray(files) ? files : [files]

  let zipProgram, zipArgs

  if (process.platform === 'win32') {
    zipProgram = '7z'
    zipArgs = ['a', '-tzip', `-x!${path.dirname(exclude)}`, file, ...files]
  } else {
    zipProgram = 'zip'
    zipArgs = ['--exclude', exclude, '-r', file, ...files]
  }

  const ret = child_process.spawnSync(
    zipProgram, zipArgs,
    { cwd: cwd, encoding: 'utf8', stdio: 'inherit' }
  )

  if (ret.status !== 0) {
    // eslint-disable-next-line no-throw-literal
    throw [zipProgram, ...zipArgs].join(' \\\n\t') +
     `\n: Failed with status ${ret.status}`
  }
  // insert a blank line for niceness
  console.log()
}

// These exports are here only for tests
module.exports = {
  cleanPackageJson,
  updatePackageJson,
  getReleaseVersion,
  zipReleaseFiles
}

if (require.main === module) {
  cli()
}
