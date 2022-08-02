/* eslint-env jest */

const path = require('path')

jest.mock('./index')
const { createReleaseArchive: mockCreateReleaseArchive } = require('./index')

const cli = require('./cli')

const repoDir = path.join(__dirname, '..', '..')

describe('create-release-archive/cli', () => {
  let actualArgv

  beforeEach(() => {
    actualArgv = process.argv
  })

  afterEach(() => {
    process.argv = actualArgv
    jest.resetAllMocks()
  })

  it('parses command line arguments', async () => {
    process.argv = [
      null, null,
      '--archiveType', 'foo',
      '--destDir', 'bar',
      '--releaseName', 'baz',
      'qux'
    ]

    mockCreateReleaseArchive.mockResolvedValue('qux.foo')
    await cli.cli()

    expect(mockCreateReleaseArchive).toHaveBeenCalledWith(expect.objectContaining({
      archiveType: 'foo', destDir: 'bar', releaseName: 'baz', ref: 'qux'
    }))
  })

  it('defaults to creating a release of HEAD in the repo dir', async () => {
    process.argv = [
      null, null
    ]

    mockCreateReleaseArchive.mockResolvedValue('qux.foo')
    await cli.cli()

    expect(mockCreateReleaseArchive).toHaveBeenCalledWith(expect.objectContaining({
      archiveType: 'zip',
      destDir: repoDir,
      releaseName: expect.anything(),
      ref: 'HEAD'
    }))
  })

  it('prints an error and exits if it does not recognise the arguments', async () => {
    process.argv = [
      null, null,
      '--foo', 'bar'
    ]

    const actualConsoleLog = global.console.log
    const mockConsoleLog = jest.fn()
    global.console.log = mockConsoleLog

    await cli.cli()

    global.console.log = actualConsoleLog

    expect(mockCreateReleaseArchive).not.toHaveBeenCalled()
    expect(process.exitCode).not.toBe(0)
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringMatching(/^Usage:.*/m)
    )
  })
})
