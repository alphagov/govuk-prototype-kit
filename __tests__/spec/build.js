/* eslint-env jest */

// core dependencies
const path = require('path')

// npm dependencies
const del = require('del')
const fse = require('fs-extra')
const fs = require('graceful-fs') // fs-extra uses graceful-fs, so we need to mock that instead of fs
const sass = require('sass')

// local dependencies
const { mkdtempSync } = require('../utils')

const testDir = path.join(mkdtempSync(), 'build')

process.env.KIT_PROJECT_DIR = testDir

// Use `doMock` so the mock is not hoisted
// and `virtual` as the file does not exist
jest.doMock(
  path.join(testDir, 'package.json'),
  () => ({}),
  { virtual: true }
)

const { packageDir, projectDir } = require('../../lib/utils/paths')
const { generateAssetsSync } = require('../../lib/build')

describe('the build pipeline', () => {
  describe('generate assets', () => {
    beforeAll(() => {
      expect(
        fs.existsSync(path.join('app', 'assets', 'test'))
      ).toBe(false)

      jest.spyOn(fs, 'chmodSync').mockImplementation(() => {})
      jest.spyOn(fse, 'chmodSync').mockImplementation(() => {})
      jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'copyFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'ensureDirSync').mockImplementation(() => {})
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
      jest.spyOn(fse, 'mkdirSync').mockImplementation(() => {})
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'writeFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'readJsonSync').mockImplementation(() => ({
        sass: ['test.scss'],
        dependencies: { 'govuk-frontend': '4.0.0' },
        version: '13.0.1'
      }))

      jest.spyOn(sass, 'compile').mockImplementation((css, options) => ({ css }))

      generateAssetsSync()
    })

    afterAll(() => {
      jest.restoreAllMocks()

      del([path.join('app', 'assets', 'test')])
    })

    it('makes the plugins sass file', () => {
      expect(fse.ensureDirSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', 'sass'), { recursive: true }
      )

      expect(fse.writeFileSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', '.gitignore'),
        '*'
      )

      expect(fse.writeFileSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', 'sass', '_plugins.scss'),
        expect.stringContaining('$govuk-plugins-url-context')
      )
    })

    it('compiles sass', () => {
      const options = {
        quietDeps: true,
        loadPaths: [projectDir],
        sourceMap: true,
        style: 'expanded',
        functions: expect.objectContaining({
          'plugin-version-satisfies($plugin-name, $semver-range)': expect.any(Function)
        })
      }
      expect(sass.compile).toHaveBeenCalledWith(
        expect.stringContaining(path.join(packageDir, 'lib', 'assets', 'sass', 'prototype.scss')),
        expect.objectContaining(options)
      )

      expect(fse.writeFileSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', 'public', 'stylesheets', 'application.css'),
        path.join(packageDir, 'lib', 'assets', 'sass', 'prototype.scss')
      )

      expect(sass.compile).not.toHaveBeenCalledWith(expect.stringContaining(path.join('app', 'assets', 'sass', 'application.scss')), expect.objectContaining(options))
    })
  })
})
