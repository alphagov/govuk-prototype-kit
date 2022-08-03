/* eslint-env jest */

const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

jest.mock('./util/fetch-original')
jest.mock('./util', () => {
  const originalModule = jest.requireActual('./util')

  return {
    ...originalModule,
    getProjectVersion: jest.fn(async () => '')
  }
})
const { fetchOriginal: mockFetchOriginal } = require('./util/fetch-original')
const { getProjectVersion: mockGetProjectVersion } = require('./util')
const { projectDir } = require('../path-utils')

const { updateJavascripts } = require('./update-javascripts')

const originalApplicationJs = `/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
})
`
const newApplicationJs = fs.readFileSync(
  path.join('app', 'assets', 'javascripts', 'application.js'),
  'utf8'
)

describe('updateJavascripts', () => {
  let mockCopyFile, mockReadFile, mockUnlink, mockWriteFile

  beforeEach(async () => {
    mockGetProjectVersion.mockResolvedValue(
      '12.1.1'
    )

    mockFetchOriginal.mockResolvedValue(
      originalApplicationJs
    )

    mockReadFile = jest.spyOn(fsp, 'readFile').mockResolvedValue(
      newApplicationJs
    )

    mockCopyFile = jest.spyOn(fsp, 'copyFile').mockImplementation(async () => {})
    mockUnlink = jest.spyOn(fsp, 'unlink').mockImplementation(async () => {})
    mockWriteFile = jest.spyOn(fsp, 'writeFile').mockImplementation(async () => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('replaces application.js if the user has not updated it', async () => {
    // theirs
    mockReadFile.mockResolvedValueOnce(
      originalApplicationJs
    )

    await updateJavascripts()

    expect(mockCopyFile).toHaveBeenCalledWith(
      path.join(projectDir, 'update', 'app', 'assets', 'javascripts', 'application.js'),
      path.join(projectDir, 'app', 'assets', 'javascripts', 'application.js')
    )
  })

  it('rewrites application.js if the user has added lines to the bottom of the file', async () => {
    // theirs
    mockReadFile.mockResolvedValueOnce(
      originalApplicationJs + '\ncallMyCode()\n'
    )
    // ours
    mockReadFile.mockResolvedValue(
      newApplicationJs
    )

    await updateJavascripts()

    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'assets', 'javascripts', 'application.js'),
      newApplicationJs + '\ncallMyCode()\n',
      'utf8'
    )
  })

  it('does not touch application.js if the user prototype is already on v13', async () => {
    mockGetProjectVersion.mockResolvedValue(
      '13.0.0'
    )

    await updateJavascripts()

    expect(mockReadFile).not.toHaveBeenCalled()
    expect(mockWriteFile).not.toHaveBeenCalled()
    expect(mockCopyFile).not.toHaveBeenCalled()
  })

  it('removes files that have been moved from app folder', async () => {
    await updateJavascripts()

    expect(mockUnlink).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'assets', 'javascripts', 'auto-store-data.js')
    )
    expect(mockUnlink).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'assets', 'javascripts', 'jquery-1.11.3.js')
    )
    expect(mockUnlink).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'assets', 'javascripts', 'step-by-step-nav.js')
    )
    expect(mockUnlink).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'assets', 'javascripts', 'step-by-step-navigation.js')
    )
  })
})
