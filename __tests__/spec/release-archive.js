/* eslint-env jest */

const childProcess = require('child_process')
const path = require('path')

const utils = require('./utils')

describe('release archive', () => {
  var archivePath
  var archiveFiles

  beforeAll(() => {
    archivePath = utils.mkReleaseArchiveSync()

    console.log(`test release archive saved to ${archivePath}`)

    archiveFiles = childProcess.execSync(`zipinfo -1 ${archivePath}`, { encoding: 'utf8' })
      .trim().split('\n').map(
        p => p.substring(path.parse(archivePath).name.length + 1)
      ).filter(
        p => p
      )
  })

  it('contains the prototype kit files', () => {
    expect(archiveFiles).toEqual(expect.arrayContaining([
      'app/',
      'lib/',
      'lib/build/',
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
