/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fse = require('fs-extra')
const fs = require('graceful-fs') // fs-extra uses graceful-fs, so we need to mock that instead of fs
const path = require('path')

const del = require('del')
const sass = require('sass')

const { projectDir } = require('../../lib/path-utils')
const { generateAssetsSync } = require('../../lib/build/tasks')

describe('the build pipeline', () => {
  describe('generate assets', () => {
    beforeAll(() => {
      expect(
        fs.existsSync(path.join('app', 'assets', 'test'))
      ).toBe(false)

      fs.mkdirSync(path.join('app', 'assets', 'test'))
      fs.writeFileSync(path.join('app', 'assets', 'test', 'testtest'), '', 'utf8')

      jest.spyOn(fs, 'chmodSync').mockImplementation(() => {})
      jest.spyOn(fse, 'chmodSync').mockImplementation(() => {})
      jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'copyFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'ensureDirSync').mockImplementation(() => {})
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
      jest.spyOn(fse, 'mkdirSync').mockImplementation(() => {})
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
      jest.spyOn(fse, 'writeFileSync').mockImplementation(() => {})

      jest.spyOn(sass, 'compile').mockImplementation((css, options) => ({ css }))

      generateAssetsSync()
    })

    afterAll(() => {
      jest.restoreAllMocks()

      del([path.join('app', 'assets', 'test')])
    })

    it('can be run from the command line', () => {
      const proc = child_process.spawnSync(
        'node', ['lib/build/generate-assets'],
        { cwd: path.resolve(__dirname, '..', '..'), encoding: 'utf8' }
      )

      expect(proc).toEqual(expect.objectContaining(
        { status: 0 }
      ))
    })

    it('makes the extensions sass file', () => {
      expect(fse.ensureDirSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', 'sass'), { recursive: true }
      )

      expect(fse.writeFileSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', '.gitignore'),
        '*'
      )

      expect(fse.writeFileSync).toHaveBeenCalledWith(
        path.join(projectDir, '.tmp', 'sass', '_extensions.scss'),
        expect.stringContaining('$govuk-extensions-url-context')
      )
    })

    it('compiles sass', () => {
      const options = {
        quietDeps: true,
        loadPaths: [projectDir],
        sourceMap: true,
        style: 'expanded'
      }
      expect(sass.compile).toHaveBeenCalledWith(expect.stringContaining(path.join(projectDir, 'lib', 'assets', 'sass', 'prototype.scss')), expect.objectContaining(options))

      expect(fse.writeFileSync).toHaveBeenCalledWith(
        path.join('public', 'stylesheets', 'application.css'),
        path.join(projectDir, 'lib', 'assets', 'sass', 'prototype.scss')
      )

      expect(sass.compile).not.toHaveBeenCalledWith(expect.stringContaining(path.join('app', 'assets', 'sass', 'application.scss')), expect.objectContaining(options))
    })

    it('copies javascript to the public folder', () => {
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join(projectDir, 'lib', 'assets', 'javascripts', 'kit.js'),
        path.join('public', '_kit', 'javascripts', 'kit.js')
      )

      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join('app', 'assets', 'javascripts', 'application.js'),
        path.join('public', 'javascripts', 'application.js')
      )
    })

    it('copies images to the public folder', () => {
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join('app', 'assets', 'images', 'unbranded.ico'),
        path.join('public', 'images', 'unbranded.ico')
      )
    })

    it('copies files from the assets folder', () => {
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join('public', 'test')
      )
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join('app', 'assets', 'test', 'testtest'),
        path.join('public', 'test', 'testtest')
      )
    })
  })
})
