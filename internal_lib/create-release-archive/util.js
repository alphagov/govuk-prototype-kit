const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const fsp = require('fs').promises
const os = require('os')
const path = require('path')
const { promisify } = require('util')

const execPromise = promisify(child_process.exec)
const execFilePromise = promisify(child_process.execFile)

const tar = require('tar')

const packageJsonScriptsInclude = [
  'start',
  'build',
  'serve'
]
const repoDir = path.join(__dirname, '..', '..')

module.exports.repoDir = repoDir

module.exports.updatePackageJson = async function (file, updater, { verbose } = {}) {
  let pkg
  pkg = JSON.parse(await fsp.readFile(file, { encoding: 'utf8' }))
  pkg = updater(pkg)
  const formattedJson = JSON.stringify(pkg, null, 2).replace(/\n/g, os.EOL) + os.EOL
  await fsp.writeFile(file, formattedJson, { encoding: 'utf8' })
  // update package-lock.json to match
  await execPromise(
    'npm install',
    { cwd: path.dirname(file), encoding: 'utf8', stdio: verbose ? 'inherit' : 'ignore' }
  )
}

module.exports.updatePackageJsonSync = function (file, updater, { verbose } = {}) {
  let pkg
  pkg = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }))
  pkg = updater(pkg)
  const formattedJson = JSON.stringify(pkg, null, 2).replace(/\n/g, os.EOL) + os.EOL
  fs.writeFileSync(file, formattedJson, { encoding: 'utf8' })
  // update package-lock.json to match
  child_process.execSync(
    'npm install',
    { cwd: path.dirname(file), encoding: 'utf8', stdio: verbose ? 'inherit' : 'ignore' }
  )
}

module.exports.cleanPackageJson = function (pkg) {
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

module.exports.getReleaseVersion = async function (ref) {
  if (!ref) {
    const packageVersion = JSON.parse(
      await fsp.readFile(path.join(repoDir, 'package.json'), { encoding: 'utf8' })
    ).version
    if (await module.exports.isNewVersion(packageVersion)) {
      return packageVersion
    }
  }

  ref = ref || 'HEAD'

  const versionString = (await execPromise(`git describe --tags ${ref}`, { encoding: 'utf8' })).stdout.trim()
  const version = versionString.slice(1) // drop the initial 'v'

  return version
}

module.exports.getReleaseVersionSync = function (ref) {
  if (!ref) {
    const packageVersion = JSON.parse(
      fs.readFileSync(path.join(repoDir, 'package.json'), { encoding: 'utf8' })
    ).version
    if (module.exports.isNewVersionSync(packageVersion)) {
      return packageVersion
    }
  }

  ref = ref || 'HEAD'

  const versionString = child_process.execSync(`git describe --tags ${ref}`, { encoding: 'utf8' }).trim()
  const version = versionString.slice(1) // drop the initial 'v'

  return version
}

module.exports.isNewVersion = async function (version) {
  const spawnPromise = new Promise((resolve, reject) => {
    const subprocess = child_process.spawn('git', ['rev-parse', `v${version}`], { stdio: 'ignore' })
    subprocess.on('error', (err) => reject(err))
    subprocess.on('exit', () => resolve(subprocess))
  })
  return !!(await spawnPromise).exitCode
}

module.exports.isNewVersionSync = function (version) {
  return !!child_process.spawnSync(
    'git', ['rev-parse', `v${version}`]
  ).status
}

module.exports.copyReleaseFiles = async function (src, dest, { prefix, ref }) {
  // We are currently using the export-ignore directives in .gitattributes to
  // decide which files to include in the release archive, so the easiest way
  // to copy all the release files is `git archive`
  await execPromise(
    `git archive --format=tar --prefix="${prefix}/" ${ref} | tar -C ${dest} -xf -`,
    { cwd: src }
  )
}

module.exports.copyReleaseFilesSync = function (src, dest, { prefix, ref }) {
  // We are currently using the export-ignore directives in .gitattributes to
  // decide which files to include in the release archive, so the easiest way
  // to copy all the release files is `git archive`
  child_process.execSync(
    `git archive --format=tar --prefix="${prefix}/" ${ref} | tar -C ${dest} -xf -`,
    { cwd: src }
  )
}

module.exports.archiveReleaseFiles = async function ({ cwd, file, prefix, verbose = false }) {
  const archiveType = path.parse(file).ext.slice(1)
  if (archiveType === 'zip') {
    await zipCreate(
      {
        cwd: cwd,
        file: path.resolve(file),
        exclude: path.join(prefix, 'node_modules', '*'),
        verbose
      },
      prefix
    )
  } else if (archiveType === 'tar') {
    await tar.create(
      {
        cwd: cwd,
        file: file,
        filter: (p) => !p.startsWith(path.posix.join(prefix, 'node_modules')),
        portable: true
      },
      [prefix]
    )
  } else {
    throw new Error(`unrecognized archiveType '${archiveType}'`)
  }
}

module.exports.archiveReleaseFilesSync = function ({ cwd, file, prefix, verbose = false }) {
  const archiveType = path.parse(file).ext.slice(1)
  if (archiveType === 'zip') {
    zipCreateSync(
      {
        cwd: cwd,
        file: path.resolve(file),
        exclude: path.join(prefix, 'node_modules', '*'),
        verbose
      },
      prefix
    )
  } else if (archiveType === 'tar') {
    tar.create(
      {
        cwd: cwd,
        file: file,
        filter: (p) => !p.startsWith(path.posix.join(prefix, 'node_modules')),
        portable: true,
        sync: true
      },
      [prefix]
    )
  } else {
    throw new Error(`unrecognized archiveType '${archiveType}'`)
  }
}

async function zipCreate ({ cwd, file, exclude, verbose = false }, files) {
  files = Array.isArray(files) ? files : [files]

  let zipProgram, zipArgs

  if (process.platform === 'win32') {
    zipProgram = '7z'
    zipArgs = ['a', '-tzip', `-x!${path.dirname(exclude)}`, file, ...files]
  } else {
    zipProgram = 'zip'
    zipArgs = ['--exclude', exclude, '-r', file, ...files]
  }

  try {
    await execFilePromise(
      zipProgram, zipArgs,
      { cwd: cwd, encoding: 'utf8', stdio: verbose ? 'inherit' : 'ignore' }
    )
  } catch (error) {
    // eslint-disable-next-line no-throw-literal
    throw [zipProgram, ...zipArgs].join(' \\\n\t') +
     `\n: Failed with status ${error.code}`
  }
}

function zipCreateSync ({ cwd, file, exclude, verbose = false }, files) {
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
    { cwd: cwd, encoding: 'utf8', stdio: verbose ? 'inherit' : 'ignore' }
  )

  if (ret.status !== 0) {
    // eslint-disable-next-line no-throw-literal
    throw [zipProgram, ...zipArgs].join(' \\\n\t') +
     `\n: Failed with status ${ret.status}`
  }
}
