/* eslint-env jest */

const fs = require('fs').promises
const path = require('path')

jest.mock('./fetch-original')
const { fetchOriginal: mockFetchOriginal } = require('./fetch-original')
const { projectDir } = require('../../path-utils')

const { getProjectVersion, patchUserFile } = require('./index.js')

afterEach(() => {
  jest.restoreAllMocks()
})

describe('getProjectVersion', () => {
  it('reads the VERSION.txt file to get the version number', async () => {
    const mockReadFile = jest.spyOn(fs, 'readFile').mockImplementation(
      async () => '99.99.99\n'
    )

    await expect(getProjectVersion()).resolves.toEqual('99.99.99')
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining(`${path.sep}VERSION.txt`),
      'utf8'
    )
  })
})

describe('patchUserFile', () => {
  const filePath = 'app/assets/javascripts/application.js'

  const originalContents = `/* global $ */
$(document).ready(function () {
  window.GOVUKFrontend.initAll()
})
`

  const newContents = `window.GOVUKPrototypeKit.ready(() => {
  // Add JavaScript here
})
`

  let mockCopyFile, mockReadFile, mockWriteFile

  beforeEach(() => {
    mockFetchOriginal.mockResolvedValue(
      originalContents
    )

    mockReadFile = jest.spyOn(fs, 'readFile').mockResolvedValue(
      newContents
    )

    mockCopyFile = jest.spyOn(fs, 'copyFile').mockImplementation(() => {})
    mockWriteFile = jest.spyOn(fs, 'writeFile').mockImplementation(() => {})
  })

  it('gets the original contents to compare with the user file', async () => {
    mockReadFile.mockResolvedValue(
      originalContents
    )

    mockFetchOriginal.mockResolvedValue(
      originalContents
    )

    await patchUserFile('99.99.99', filePath)

    expect(mockFetchOriginal).toHaveBeenCalledWith(
      '99.99.99', filePath
    )
  })

  it('replaces file if the user has not updated it', async () => {
    mockReadFile.mockResolvedValueOnce(
      originalContents
    )

    await patchUserFile('99.99.99', filePath)

    expect(mockCopyFile).toHaveBeenCalledWith(
      path.join(projectDir, 'update', 'app', 'assets', 'javascripts', 'application.js'),
      path.join(projectDir, 'app', 'assets', 'javascripts', 'application.js')
    )
  })

  it('rewrites file if the user has added lines to the bottom of the file', async () => {
    // theirs
    jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
      originalContents + '\ncallMyCode()\n'
    )
    // ours
    jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
      newContents
    )

    await patchUserFile('99.99.99', filePath)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('app', 'assets', 'javascripts', 'application.js')),
      newContents + '\ncallMyCode()\n',
      'utf8'
    )
  })

  it('warns user and does not touch file if the user has rewritten it a lot', async () => {
    // theirs
    jest.spyOn(fs, 'readFile').mockImplementationOnce(
      async () => 'justMyCode()\n'
    )
    // ours
    jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
      newContents
    )

    const mockConsoleWarn = jest.spyOn(global.console, 'warn').mockImplementation(() => {})

    await patchUserFile('99.99.99', filePath)

    expect(mockWriteFile).not.toHaveBeenCalled()
    expect(mockCopyFile).not.toHaveBeenCalled()
    expect(mockConsoleWarn).toHaveBeenCalled()
  })

  it('does nothing if file has already been updated somehow', async () => {
    // theirs
    jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
      newContents
    )
    // ours
    jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
      newContents
    )

    const mockConsoleWarn = jest.spyOn(global.console, 'warn')

    await patchUserFile('99.99.99', filePath)

    expect(mockWriteFile).not.toHaveBeenCalled()
    expect(mockCopyFile).not.toHaveBeenCalled()
    expect(mockConsoleWarn).not.toHaveBeenCalled()
  })
})
