/* eslint-env jest */

const path = require('path')

const tar = require('tar')

const utils = require('../util')

describe('release archive', () => {
  var archivePath
  var archiveFiles

  beforeAll(async () => {
    archivePath = await utils.mkReleaseArchive()

    archiveFiles = []

    await tar.list({
      file: archivePath,
      onentry: (entry) => {
        const p = entry.path.substring(path.parse(archivePath).name.length + 1)
        if (p) { archiveFiles.push(p) }
      }
    })
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

    expect(archiveFiles.filter(p => /.*\.test\.js$/.test(p)))
      .toEqual([])
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
