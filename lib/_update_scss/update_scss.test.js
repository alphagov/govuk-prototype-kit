/* eslint-env jest */

const fs = require('fs')
const path = require('path')
const updateKit = require('./update_scss')
const { appSassPath } = require('./update_scss')

describe('scripts/update-kit', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('removeLegacyIE8Sass', () => {
    it('removes all matching prototype kit sass files from the app sass folder', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync').mockReturnValue(undefined)

      updateKit.removeLegacyIE8Sass()
      expect(unlinkSyncSpy).toHaveBeenNthCalledWith(1, path.join(appSassPath, 'application-ie8.scss'))
      expect(unlinkSyncSpy).toHaveBeenNthCalledWith(2, path.join(appSassPath, 'unbranded-ie8.scss'))
    })
  })
})
