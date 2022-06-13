/* eslint-env jest */

const fs = require('fs')
const updateKit = require('./update-kit')
const path = require('path')
const { projectDir } = require('../path-utils')

describe('scripts/update-kit', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('removeKitSassFromApplicationSass', () => {
    it('removes all the lines above the "Add extra styles here" comment ', () => {
      const sassLines = [
        'prototype kit styles',
        '// Add extra styles here',
        'user custom styles'
      ]
      const applicationScssPath = path.join(projectDir, 'app', 'assets', 'sass', 'application.scss')

      jest.spyOn(fs, 'readFileSync').mockImplementation(() => sassLines.join('\n'))
      const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockReturnValue(undefined)

      updateKit.removeKitSassFromApplicationSass()
      expect(writeFileSyncSpy).toHaveBeenCalledWith(applicationScssPath, `${sassLines[1]}\n${sassLines[2]}`)
    })
  })

  describe('removeKitSassFromAppSassPath', () => {
    it('removes all matching prototype kit sass files from the app sass folder', () => {
      const prototypeKitFiles = [
        'kit-1.scss',
        'kit-2.scss',
        'kit-3.scss',
        'kit-4.scss'
      ]
      const appFiles = [
        'app-1.scss',
        'app-2.scss',
        'kit-1.scss',
        'kit-2.scss'
      ]

      jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
        return appFiles.map(name => ({ name, isFile: () => true }))
      })
      jest.spyOn(fs, 'existsSync').mockImplementation((filePath) => {
        return prototypeKitFiles.includes(filePath)
      })
      const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync').mockReturnValue(undefined)

      updateKit.removeKitSassFromAppSassPath('', '')
      expect(unlinkSyncSpy).toHaveBeenCalledTimes(2)
    })
  })
})
