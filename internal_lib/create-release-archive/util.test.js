/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const util = require('util')
const { EventEmitter } = require('events')

const mockExecPromise = jest.fn(async () => {})
const mockExecFilePromise = jest.fn(async () => {})
jest.spyOn(util, 'promisify').mockImplementation(() => {})
util.promisify.mockReturnValueOnce(mockExecPromise)
util.promisify.mockReturnValueOnce(mockExecFilePromise)

const tar = require('tar')

const createReleaseArchive = require('./util')

const repoDir = path.join(__dirname, '..', '..')

afterEach(() => {
  jest.restoreAllMocks()
})

describe('create-release-archive/util', () => {
  describe('isNewVersion', () => {
    it('resolves to true if version has not been released previously', async () => {
      await expect(
        createReleaseArchive.isNewVersion('99.99.99')
      ).resolves.toBe(true)
    })

    it('resolves to false if version has not been released previously', async () => {
      await expect(
        createReleaseArchive.isNewVersion('12.1.1')
      ).resolves.toBe(false)
    })
  })

  describe('getReleaseVersion', () => {
    it('resolves the version from package.json if that version has not been released before', async () => {
      jest.spyOn(fsp, 'readFile').mockImplementation(() => '{ "version": "foo" }')
      await expect(
        createReleaseArchive.getReleaseVersion()
      ).resolves.toEqual('foo')
    })

    it('resolves a string describing the current HEAD if the code has been changed since a release', async () => {
      // mock spawn('git rev-parse ...') to make isNewVersion always false
      jest.spyOn(child_process, 'spawn').mockImplementation(() => {
        const mockSubprocess = new EventEmitter()
        mockSubprocess.exitCode = 0
        setTimeout(() => mockSubprocess.emit('exit'), 1000)
        return mockSubprocess
      })

      mockExecPromise.mockResolvedValue({ stdout: 'v12.1.0-99-g2ea97da8\n' })

      await expect(
        createReleaseArchive.getReleaseVersion()
      ).resolves.toMatch('12.1.0-99-g2ea97da8')

      expect(mockExecPromise).toHaveBeenCalledWith(
        'git describe --tags HEAD', expect.anything()
      )
    })

    it('tells us the version number of the release described by a ref', async () => {
      // temporarily install the real implementation
      mockExecPromise.mockImplementation(util.promisify(child_process.exec))

      await expect(
        createReleaseArchive.getReleaseVersion('v12.1.0')
      ).resolves.toEqual('12.1.0')
    })
  })

  describe('getReleaseVersionSync', () => {
    it('returns the version from package.json if that version has not been released before', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => '{ "version": "foo" }')
      expect(
        createReleaseArchive.getReleaseVersionSync()
      ).toEqual('foo')
    })

    it('returns a string describing the current HEAD if the code has been changed since a release', () => {
      // mock spawnSync('git rev-parse ...') to make isNewVersion always false
      jest.spyOn(child_process, 'spawnSync')
        .mockImplementation(() => ({ status: 0 }))

      const mockExecSync = jest.spyOn(child_process, 'execSync')
        .mockImplementation(() => 'v12.1.0-99-g2ea97da8\n')

      expect(
        createReleaseArchive.getReleaseVersionSync()
      ).toMatch('12.1.0-99-g2ea97da8')

      expect(mockExecSync).toHaveBeenCalledWith(
        'git describe --tags HEAD', expect.anything()
      )
    })

    it('tells us the version number of the release described by a ref', () => {
      expect(
        createReleaseArchive.getReleaseVersionSync('v12.1.0')
      ).toEqual('12.1.0')
    })
  })

  describe('cleanPackageJson', () => {
    let packageJson

    beforeEach(() => {
      packageJson = JSON.parse(
        fs.readFileSync(path.join(repoDir, 'package.json'), { encoding: 'utf8' })
      )
    })

    it('deletes dev dependencies', () => {
      expect(packageJson).toHaveProperty('devDependencies')
      packageJson = createReleaseArchive.cleanPackageJson(packageJson)
      expect(packageJson).not.toHaveProperty('devDependencies')
    })

    it('deletes configuration for dev tools', () => {
      packageJson = createReleaseArchive.cleanPackageJson(packageJson)
      expect(packageJson).not.toHaveProperty('jest')
      expect(packageJson).not.toHaveProperty('standard')
    })

    it('deletes all dev scripts', () => {
      expect(packageJson).toHaveProperty('scripts')
      packageJson = createReleaseArchive.cleanPackageJson(packageJson)
      expect(packageJson).not.toHaveProperty('scripts.lint')
      expect(packageJson).not.toHaveProperty('scripts.test')
      expect(packageJson.scripts).toMatchSnapshot()
    })
  })

  describe('updatePackageJson', () => {
    let fakeFs

    beforeEach(() => {
      fakeFs = {}
      fakeFs['package.json'] = fs.readFileSync(path.join(repoDir, 'package.json'), { encoding: 'utf8' })
      jest.spyOn(fsp, 'readFile').mockImplementation(async (path) => fakeFs[path])
      jest.spyOn(fsp, 'writeFile').mockImplementation(async (path, data) => { fakeFs[path] = data })
    })

    it('updates a package.json file using the function updater', async () => {
      await createReleaseArchive.updatePackageJson('package.json', () => { return {} })
      expect(fakeFs['package.json']).toMatch('{}')
    })

    it('preserves the formatting of the package.json file', async () => {
      const before = fakeFs['package.json']
      await createReleaseArchive.updatePackageJson('package.json', (x) => x)
      expect(fakeFs['package.json']).toMatch(before)
    })

    it('runs npm install after changing the file', async () => {
      fakeFs['test/package.json'] = fakeFs['package.json']
      mockExecPromise.mockImplementation(async () => {})

      await createReleaseArchive.updatePackageJson('test/package.json', () => { return {} })

      expect(mockExecPromise).toHaveBeenCalledWith(
        'npm install', expect.objectContaining({ cwd: 'test' })
      )
    })
  })

  describe('updatePackageJsonSync', () => {
    let fakeFs
    let mockExecSync

    beforeEach(() => {
      fakeFs = {}
      fakeFs['package.json'] = fs.readFileSync(path.join(repoDir, 'package.json'), { encoding: 'utf8' })
      jest.spyOn(fs, 'readFileSync').mockImplementation((path) => fakeFs[path])
      jest.spyOn(fs, 'writeFileSync').mockImplementation((path, data) => { fakeFs[path] = data })

      mockExecSync = jest.spyOn(child_process, 'execSync').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('updates a package.json file using the function updater', () => {
      createReleaseArchive.updatePackageJsonSync('package.json', () => { return {} })
      expect(fakeFs['package.json']).toMatch('{}')
    })

    it('preserves the formatting of the package.json file', () => {
      const before = fakeFs['package.json']
      createReleaseArchive.updatePackageJsonSync('package.json', (x) => x)
      expect(fakeFs['package.json']).toMatch(before)
    })

    it('runs npm install after changing the file', () => {
      fakeFs['test/package.json'] = fakeFs['package.json']
      createReleaseArchive.updatePackageJsonSync('test/package.json', () => { return {} })

      expect(mockExecSync).toHaveBeenCalledWith(
        'npm install', expect.objectContaining({ cwd: 'test' })
      )
    })
  })

  describe('archiveReleaseFiles', () => {
    let mockTarCreate

    beforeEach(() => {
      mockTarCreate = jest.spyOn(tar, 'create').mockImplementation(() => {})
    })

    it('zips release files by default', async () => {
      if (process.platform === 'win32') {
        await createReleaseArchive.archiveReleaseFiles({ cwd: 'C:\\tmp', file: 'C:\\test.zip', prefix: 'test' })
        expect(mockExecFilePromise).toBeCalledWith(
          '7z', ['a', '-tzip', '-x!test\\node_modules', 'C:\\test.zip', 'test'],
          expect.objectContaining({ cwd: 'C:\\tmp' })
        )
      } else {
        await createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: '/test.zip', prefix: 'test' })
        expect(mockExecFilePromise).toBeCalledWith(
          'zip', ['--exclude', 'test/node_modules/*', '-r', '/test.zip', 'test'],
          expect.objectContaining({ cwd: '/tmp' })
        )
      }
    })

    it('resolves paths correctly for arguments to zip', async () => {
      if (process.platform === 'win32') {
        await createReleaseArchive.archiveReleaseFiles({ cwd: 'C:\\tmp', file: 'test.zip', prefix: 'test' })
        expect(mockExecFilePromise).toBeCalledWith(
          '7z', ['a', '-tzip', '-x!test\\node_modules', path.join(repoDir, 'test.zip'), 'test'],
          expect.objectContaining({ cwd: 'C:\\tmp' })
        )
      } else {
        await createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: 'test.zip', prefix: 'test' })
        expect(mockExecFilePromise).toBeCalledWith(
          'zip', ['--exclude', 'test/node_modules/*', '-r', path.join(repoDir, 'test.zip'), 'test'],
          expect.objectContaining({ cwd: '/tmp' })
        )
      }
    })

    it('tars release files if file extension is .tar', async () => {
      await createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: '/test.tar', prefix: 'test' })
      expect(mockTarCreate).toBeCalledWith(
        expect.objectContaining({ cwd: '/tmp', file: '/test.tar' }),
        ['test']
      )
    })

    it('throws an error if file extension is unrecognised', async () => {
      await expect(
        createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: '/test.8z', prefix: 'test' })
      ).rejects.toThrow()
    })
  })

  describe('archiveReleaseFilesSync', () => {
    let mockSpawnSync, mockTarCreate

    beforeEach(() => {
      mockSpawnSync = jest.spyOn(child_process, 'spawnSync').mockImplementation(() => ({ status: 0 }))
      mockTarCreate = jest.spyOn(tar, 'create').mockImplementation(() => {})
    })

    it('zips release files by default', () => {
      if (process.platform === 'win32') {
        createReleaseArchive.archiveReleaseFilesSync({ cwd: 'C:\\tmp', file: 'C:\\test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          '7z', ['a', '-tzip', '-x!test\\node_modules', 'C:\\test.zip', 'test'],
          expect.objectContaining({ cwd: 'C:\\tmp' })
        )
      } else {
        createReleaseArchive.archiveReleaseFilesSync({ cwd: '/tmp', file: '/test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          'zip', ['--exclude', 'test/node_modules/*', '-r', '/test.zip', 'test'],
          expect.objectContaining({ cwd: '/tmp' })
        )
      }
    })

    it('resolves paths correctly for arguments to zip', () => {
      if (process.platform === 'win32') {
        createReleaseArchive.archiveReleaseFilesSync({ cwd: 'C:\\tmp', file: 'test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          '7z', ['a', '-tzip', '-x!test\\node_modules', path.join(repoDir, 'test.zip'), 'test'],
          expect.objectContaining({ cwd: 'C:\\tmp' })
        )
      } else {
        createReleaseArchive.archiveReleaseFilesSync({ cwd: '/tmp', file: 'test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          'zip', ['--exclude', 'test/node_modules/*', '-r', path.join(repoDir, 'test.zip'), 'test'],
          expect.objectContaining({ cwd: '/tmp' })
        )
      }
    })

    it('tars release files if file extension is .tar', () => {
      createReleaseArchive.archiveReleaseFilesSync({ cwd: '/tmp', file: '/test.tar', prefix: 'test' })
      expect(mockTarCreate).toBeCalledWith(
        expect.objectContaining({ cwd: '/tmp', file: '/test.tar' }),
        ['test']
      )
    })

    it('throws an error if file extension is unrecognised', () => {
      expect(
        () => createReleaseArchive.archiveReleaseFilesSync({ cwd: '/tmp', file: '/test.8z', prefix: 'test' })
      ).toThrow()
    })
  })
})
