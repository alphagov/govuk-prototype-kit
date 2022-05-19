/* eslint-env jest */

const childProcess = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const repoDir = path.resolve(__dirname, '..', '..')

const headReleaseVersion = childProcess.execSync(
  'git rev-parse HEAD', { encoding: 'utf8' }
).trim()
const headReleaseBasename = `govuk-prototype-kit-${headReleaseVersion}`
const headReleaseArchiveFilename = `${headReleaseBasename}.zip`

describe('release archive', () => {
  var archivePath
  var archiveFiles

  beforeAll(() => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-'))
    const fixtureDir = path.resolve(tmpDir, '__fixtures__')

    fs.mkdirSync(fixtureDir)
    archivePath = path.join(fixtureDir, headReleaseArchiveFilename)

    // Create a release archive from the HEAD we are running tests in
    childProcess.execSync(
      `git archive --prefix=${archivePath}/ --output=${headReleaseArchivePath} HEAD`,
      { cwd: repoDir }
    )

    console.log(`test release archive saved to ${archivePath}`)

    headReleaseArchiveFiles = childProcess.execSync(`zipinfo -1 ${archivePath}`, { encoding: 'utf8' })
      .trim().split('\n').map(
        p => p.substring(headReleaseBasename.length + 1)
      ).filter(
        p => p
      )
  })

  it('contains the prototype kit files', () => {
    expect(archiveFiles).toEqual(expect.arrayContaining([
      'app/',
      'lib/',
      'gulp/',
      'gulpfile.js',
      'listen-on-port.js',
      'server.js',
      'Procfile',
      'VERSION.txt'
    ]))
  })

  it('contains a package lockfile', () => {
    expect(archiveFiles).toContain('package-lock.json')
  })

  it('does not contain the update script', () => {
    expect(archiveFiles).not.toContain('update.sh')
  })

  it('does not contain test files', () => {
    expect(archiveFiles).not.toContain('__tests__/')
    expect(archiveFiles).not.toContain('cypress/')
    expect(archiveFiles).not.toContain('cypress.json')

    expect(archiveFiles).not.toContainEqual(
      expect.stringMatching(/.*\.test\.js$/)
    )
  })

  it('does not contain internal files', () => {
    expect(archiveFiles).not.toContain('.github/')
    expect(archiveFiles).not.toContain('.gitattributes')
    expect(archiveFiles).not.toContain('internal_docs/')
    expect(archiveFiles).not.toContain('node_modules/')
    expect(archiveFiles).not.toContain('create_release.sh')

    expect(archiveFiles).not.toContainEqual(
      expect.stringContaining('CODEOWNERS')
    )
  })
})
