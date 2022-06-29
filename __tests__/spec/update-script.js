/* eslint-env jest */
const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs').promises
const path = require('path')
const process = require('process')
const { promisify } = require('util')

const _ = require('lodash')

const utils = require('../util')
const fse = require('fs-extra')

const execPromise = promisify(child_process.exec)
const execFilePromise = promisify(child_process.execFile)

/*
 * Constants
 */

const repoDir = path.resolve(__dirname, '..', '..')
const script = path.join(repoDir, 'update.sh')

// When running tests using Windows GitHub runner, make sure to use gitbash.
// Path is from https://github.com/actions/virtual-environments/blob/win19/20211110.1/images/win/Windows2019-Readme.md
const bash = process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/bash'

/*
 * Test helpers
 */

/**
 * Run update.sh, or one of the functions defined in it.
 *
 * runScript([fnName][, options])
 *
 * Examples:
 * runScript()  // runs `update.sh` in current working directory
 * runScript({ testDir: 'example' })  // runs `update.sh` in directory `example`
 * runScript('extract', { testDir: 'example' })  // runs `source update.sh && extract` in directory `example`
 *
 * Returns an object with output of `stdout`, `stderr`, and exit code in `status`.
 *
 * If the option `trace` is true, then the return object will also have an
 * array of strings `trace` which lists the commands called by the scripts (see
 * the bash man page and the option xtrace).
 *
 * Throws an error if the spawn fails, but does not throw an error if the
 * return status of the script or function is non-zero.
 */
async function runScript (fnName = undefined, options) {
  if (typeof fnName === 'object') {
    options = fnName
    fnName = undefined
  }

  const opts = {
    ...options,
    cwd: options.testDir,
    encoding: 'utf8',
    env: { LANG: process.env.LANG, PATH: process.env.PATH, ...(options.env || {}) }
  }

  let args

  if (fnName) {
    args = ['-c', `source '${script}' && ${fnName}`]
  } else {
    args = [script]
  }

  if (options.trace) {
    args.unshift('-x')
    opts.env.PS4 = '+xtrace '
  }

  var ret
  try {
    ret = await execFilePromise(bash, args, opts)
    ret.status = 0
  } catch (err) {
    if (err.errno !== undefined) {
      throw err
    }

    ret = {
      status: err.code,
      stdout: err.stdout,
      stderr: err.stderr
    }
  }

  if (options.trace) {
    // split the trace lines out from stderr
    let { stderr, trace } = _.groupBy(
      ret.stderr.split(/(\++xtrace [^\n]+)\n/m),
      (line) => /^\++xtrace [^\n]+/.test(line) ? 'trace' : 'stderr'
    )
    stderr = stderr.join('')
    trace = trace.map((line) => line.replace(/^(\++)xtrace /, '$1 '))
    ret.stderr = stderr
    ret.trace = trace
  }

  return ret
}

async function runScriptAndExpectSuccess (fnName = undefined, options) {
  if (typeof fnName === 'object') {
    options = fnName
    fnName = undefined
  }

  const ret = await runScript(fnName, options)
  if (ret.status !== 0) {
    throw new Error(`update.sh in ${path.resolve(options.testDir)} failed with status ${ret.status}:\n${ret.stderr}`)
  }
  return ret
}

async function runScriptAndExpectError (fnName, options) {
  if (typeof fnName === 'object') {
    options = fnName
    fnName = undefined
  }

  const oldStat = await fs.stat(options.testDir)

  const ret = await runScript(fnName, options)

  expect(ret.status).not.toBe(0)
  expect(ret.stderr).toMatch(/ERROR/)

  // tests that no files have been added or removed in test directory
  const newStat = await fs.stat(options.testDir)
  expect(newStat.mtimeMs).toBe(oldStat.mtimeMs)

  return ret
}

async function execGitStatus (testDir) {
  return (await execPromise(
    'git status --porcelain', { cwd: testDir, encoding: 'utf8' }
  )).stdout.split('\n').slice(0, -1)
}

describe('update.sh', () => {
  const _cwd = process.cwd()

  // Following tests will run in a temporary directory, to avoid messing up the project
  const tmpDir = utils.mkdtempSync()
  const fixtureDir = path.resolve(tmpDir, '__fixtures__')

  /*
   * Fixture helpers
   */

  async function mktestDir (testDir) {
    await fs.mkdir(testDir)

    await fs.writeFile(path.join(testDir, 'package.json'), '{\n  "name": "govuk-prototype-kit"\n}')
    await fs.writeFile(path.join(testDir, 'VERSION.txt'), '0.0.0')

    return testDir
  }

  // Create a test archive fixture
  async function _mktestArchive (archive) {
    const archivePath = path.parse(archive)
    const archiveName = archivePath.base
    const archivePrefix = archivePath.name
    const dirToArchive = path.join(fixtureDir, archivePrefix)

    await fs.mkdir(dirToArchive)
    await fs.writeFile(path.join(dirToArchive, 'foo'), '')
    await fs.writeFile(path.join(dirToArchive, 'VERSION.txt'), '9999.99.99')

    if (process.platform === 'win32') {
      await execPromise(`7z a ${archiveName} ${archivePrefix}`, { cwd: fixtureDir })
    } else {
      await execPromise(`zip -r ${archiveName} ${archivePrefix}`, { cwd: fixtureDir })
    }
  }

  async function mktestArchive (testDir) {
    const archive = path.resolve(fixtureDir, 'govuk-prototype-kit-foo.zip')

    try {
      await fs.access(archive)
    } catch (error) {
      await _mktestArchive(archive)
    }

    if (testDir) {
      const dest = path.join(testDir, 'update', 'govuk-prototype-kit-foo.zip')
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.copyFile(archive, path.join(testDir, 'update', 'govuk-prototype-kit-foo.zip'))
      return dest
    } else {
      return archive
    }
  }

  async function _mktestPrototype (src) {
    // Create a release archive from the HEAD we are running tests in
    await utils.mkPrototype(src)

    // Create a git repo from the new release archive so we can see changes.
    await execFilePromise('git', ['init'], { cwd: src })
    await execFilePromise('git', ['config', 'user.email', 'test@example.com'], { cwd: src })
    await execFilePromise('git', ['config', 'user.name', 'Jest Tests'], { cwd: src })

    await execFilePromise('git', ['add', '.'], { cwd: src })
    await execFilePromise('git', ['commit', '-m', 'Initial commit'], { cwd: src })

    // let's imagine our prototype has been customised slightly
    let config = await fs.readFile(path.join(src, 'app', 'config.js'), 'utf8')
    config = config.replace('Service name goes here', 'Jest test service')
    await fs.writeFile(path.join(src, 'app', 'config.js'), config, 'utf8')

    // and it has been run
    await fs.writeFile(path.join(src, 'usage-data-config.json'), '{}')

    await execFilePromise('git', ['commit', '-m', 'Test', '-a'], { cwd: src })

    // populate the update folder to speed up tests
    await utils.mkPrototype(path.join(src, 'update'))
  }

  async function mktestPrototype (dest) {
    const src = path.resolve(fixtureDir, 'prototype')
    try {
      await fs.access(src)
    } catch (error) {
      await _mktestPrototype(src)
    }

    if (dest) {
      await execPromise(`cp -r ${src} ${dest}`)
      return dest
    } else {
      return src
    }
  }

  beforeAll(async () => {
    process.chdir(tmpDir)
    console.log('Running tests in temporary directory', process.cwd())

    // setup fixtures
    // - running this now saves time later
    // - ensureDirSync is used to prevent a failure where the fixtureDir already exists from a previous test
    await fse.ensureDir(fixtureDir)
    await mktestArchive()
    await mktestPrototype()
  })

  /*
   * Tests
   */

  describe('check', () => {
    it('exits with error if run in an empty folder', async () => {
      const testDir = 'empty'
      await fs.mkdir(testDir)

      await runScriptAndExpectError({ testDir })
    })

    it('exits with error if folder does not contain a package.json file', async () => {
      const testDir = 'no-package-json'
      await fs.mkdir(testDir)
      await fs.writeFile(path.join(testDir, 'foo'), 'my important data about govuk-prototype-kit')
      await fs.writeFile(path.join(testDir, 'bar'), "don't delete my data!")

      await runScriptAndExpectError({ testDir })
    })

    it('exits with error if package.json file does not contain string govuk-prototype-kit', async () => {
      const testDir = await mktestDir('no-govuk-prototype-kit')
      await fs.writeFile(path.join(testDir, 'package.json'), '{\n  "name": "test"\n}')

      await runScriptAndExpectError({ testDir })
    })

    it('exits with error if package.json file contains string containing govuk-prototype-kit', async () => {
      const testDir = await mktestDir('name-contains-govuk-prototype-kit')
      await fs.writeFile(path.join(testDir, 'package.json'), '{\n  "name": "govuk-prototype-kit-test"\n}')

      await runScriptAndExpectError({ testDir })
    })
  })

  describe('prepare', () => {
    it('removes existing update folder', async () => {
      const testDir = 'prepare'
      await fs.mkdir(path.join(testDir, 'update'), { recursive: true })
      await fs.writeFile(path.join(testDir, 'update', 'govuk-prototype-kit-empty.zip'), '')
      const oldStat = await fs.stat(path.join(testDir, 'update'))

      await runScriptAndExpectSuccess('prepare', { testDir })

      const newStat = await fs.stat(path.join(testDir, 'update'))

      // tests that update folder _has_ been replaced
      expect(newStat.birthtimeMs).not.toBe(oldStat.birthtimeMs)
      expect(
        fs.access(path.join(testDir, 'update', 'govuk-prototype-kit-empty.zip'))
      ).rejects.toThrow()
    })

    it('does not remove existing update folder if CLEAN=0 is set', async () => {
      const testDir = 'prepare-noclean'
      await fs.mkdir(path.join(testDir, 'update'), { recursive: true })
      await fs.writeFile(path.join(testDir, 'update', 'govuk-prototype-kit-empty.zip'), '')
      const oldStat = await fs.stat(path.join(testDir, 'update'))

      await runScriptAndExpectSuccess('prepare', { testDir, env: { CLEAN: '0' } })

      const newStat = await fs.stat(path.join(testDir, 'update'))

      // tests that update folder has _not_ been replaced
      expect(newStat.birthtimeMs).toBe(oldStat.birthtimeMs)
      expect(async () => {
        await fs.access(path.join(testDir, 'update', 'govuk-prototype-kit-empty.zip'))
      }).not.toThrowError()
    })

    it('hides the update folder from git', async () => {
      const testDir = 'prepare-gitignore'
      await fs.mkdir(testDir)

      await runScriptAndExpectSuccess('prepare', { testDir })

      expect(
        (await fs.readFile(path.join(testDir, 'update', '.gitignore'), 'utf8')).trim()
      ).toBe('*')
    })
  })

  describe('fetch', () => {
    it('downloads the latest release of the prototype kit into the update folder', async () => {
      const testDir = 'fetch'
      await fs.mkdir(path.join(testDir, 'update'), { recursive: true })

      const ret = await runScriptAndExpectSuccess('fetch', { testDir, trace: true })

      expect(ret.trace).toEqual(expect.arrayContaining([
        expect.stringMatching('curl( -[LJO]*)? https://govuk-prototype-kit.herokuapp.com/docs/download')
      ]))

      expect(await fs.readdir(path.join(testDir, 'update'))).toEqual([
        expect.stringMatching(/govuk-prototype-kit-\d+\.\d+\.\d+\.zip/)
      ])
    })
  })

  describe('extract', () => {
    it('extracts the release into the update folder', async () => {
      const testDir = 'extract'
      await mktestArchive(testDir)

      await runScriptAndExpectSuccess('extract', { testDir })

      // note that the extract process should strip 1 leading component from the path,
      // so even though the archive contains:
      //   - ./govuk-prototype-kit-foo/foo
      // what we should end up with is:
      //   - ./foo
      // This is so users don't have to go digging through a complicated
      // directory heirarchy after the script has asked them to manage their config.
      await fs.access(path.join(testDir, 'update', 'foo'))
      expect(
        fs.access(path.join(testDir, 'update', 'govuk-prototype-kit-foo', 'foo'))
      ).rejects.toThrow()
    })

    it('extracts the file supplied in ARCHIVE_FILE', async () => {
      const testDir = 'extractArchiveFile'
      await fs.mkdir(path.join(testDir, 'update'), { recursive: true })

      const ret = await runScriptAndExpectSuccess(
        'extract',
        { testDir, env: { ARCHIVE_FILE: '../__fixtures__/govuk-prototype-kit-foo.zip' }, trace: true }
      )

      expect(ret.trace).not.toEqual(expect.arrayContaining([
        expect.stringMatching('curl( -[LJO]*)? https://govuk-prototype-kit.herokuapp.com/docs/download')
      ]))

      expect(ret.trace).toEqual(expect.arrayContaining([
        expect.stringMatching('unzip .*/__fixtures__/govuk-prototype-kit-foo.zip')
      ]))
    })
  })

  describe('copy', () => {
    it('updating an existing up-to-date prototype does nothing', async () => {
      const testDir = await mktestPrototype('up-to-date')

      await runScriptAndExpectSuccess('copy', { testDir })

      // expect that `git status` reports no files added, changed, or removed
      expect(await execGitStatus(testDir)).toEqual([])
    })

    it('does not remove the analytics consent', async () => {
      const testDir = await mktestPrototype('usage-data-config')

      const oldStat = await fs.stat(path.join(testDir, 'usage-data-config.json'))

      await runScriptAndExpectSuccess('copy', { testDir })

      const newStat = await fs.stat(path.join(testDir, 'usage-data-config.json'))
      expect(newStat.mtimeMs).toBe(oldStat.mtimeMs)
    })

    it('removes files that have been removed from docs, build and lib folders', async () => {
      const testDir = await mktestPrototype('remove-dangling-files')

      const updateDir = path.join(testDir, 'update')
      await fs.unlink(path.join(updateDir, 'lib', 'build', 'config.json'))

      await runScriptAndExpectSuccess('copy', { testDir })

      expect(await execGitStatus(testDir)).toEqual([
        ' D lib/build/config.json'
      ])
    })

    it('removes gulp files and adds build files if the release does not contain gulp', async () => {
      const testDir = await mktestPrototype('remove-gulp-files')

      await fs.mkdir(path.join(testDir, 'gulp'))
      await fs.writeFile(path.join(testDir, 'gulp', 'watch.js'), 'foo')
      await fs.writeFile(path.join(testDir, 'gulpfile.js'), 'bar')
      await execPromise('git add gulp/watch.js gulpfile.js', { cwd: testDir })
      await execPromise('git rm -r lib/build', { cwd: testDir })
      await execPromise('git commit -q -m "Ensure gulp files exist"', { cwd: testDir })

      await runScriptAndExpectSuccess('copy', { testDir })

      expect(await execGitStatus(testDir)).toEqual([
        ' D gulp/watch.js',
        ' D gulpfile.js',
        '?? lib/build/'
      ])
    })

    it('does not change files in apps folder, except for in assets/sass/patterns', async () => {
      const testDir = await mktestPrototype('preserve-app-folder')

      const updateDir = path.join(testDir, 'update')
      await fs.mkdir(path.join(updateDir, 'app', 'assets', 'sass', 'patterns'))
      await fs.writeFile(path.join(updateDir, 'app', 'assets', 'sass', 'patterns', '_task-list.scss'), 'foobar')
      await fs.writeFile(path.join(updateDir, 'app', 'routes.js'), 'arglebargle')

      await runScriptAndExpectSuccess('copy', { testDir })

      expect(await execGitStatus(testDir)).toEqual([
        '?? app/assets/sass/patterns/'
      ])
    })

    it('outputs errors and logs them to a file', async () => {
      const testDir = await mktestDir('error-logging')
      await mktestArchive(testDir)

      await runScriptAndExpectSuccess('extract', { testDir })
      const ret = await runScript('copy', { testDir })

      // we expect this to fail because the test archive doesn't have a docs folder
      expect(ret.status).toBe(1)

      expect(ret.stderr).toMatch(/No such file or directory/)
      expect(ret.stderr).toMatch(/ERROR/)
      expect(
        await fs.readFile(path.join(testDir, 'update', 'update.log'), 'utf8')
      ).toMatch(/No such file or directory/)
    })

    it('hides the update folder from git', async () => {
      const testDir = await mktestPrototype('copy-gitignore')

      await runScriptAndExpectSuccess('copy', { testDir })

      expect(
        (await fs.readFile(path.join(testDir, 'update', '.gitignore'), 'utf8')).trim()
      ).toBe('*')
    })
  })

  it('can be run as a piped script', async () => {
    const testDir = await mktestPrototype('pipe')

    execPromise(`cat '${script}' | bash`, { cwd: testDir, shell: bash, stdio: 'ignore' })
  })

  it('hides the update folder from git', async () => {
    const testDir = await mktestPrototype('gitignore')

    await runScriptAndExpectSuccess({ testDir })

    expect(await execGitStatus(testDir)).not.toContain('?? update/')
  })

  it('does nothing if check fails', async () => {
    const testDir = await mktestPrototype('if-check-fails')
    await execPromise('rm -rf update', { cwd: testDir })

    await fs.writeFile(path.join(testDir, 'package.json'), '{\n  "name": "my-very-customised-prototype" \n}')
    await execPromise('git commit -q -m "Customise my prototype" -a', { cwd: testDir })

    await runScriptAndExpectError({ testDir })

    expect(await execGitStatus(testDir)).toEqual([])
  })

  afterAll(() => {
    process.chdir(_cwd)
  })
})
