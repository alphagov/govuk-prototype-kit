/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const tar = require('tar')

const createReleaseArchive = require('./create-release-archive')

const repoDir = path.join(__dirname, '..')

function testFailingIf (condition, ...args) {
  if (condition) {
    return test.failing(...args)
  } else {
    return test(...args)
  }
}

describe('scripts/create-release-archive', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getReleaseVersion', () => {
    it('returns the version from package.json if that version has not been released before', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => '{ "version": "foo" }')
      expect(
        createReleaseArchive.getReleaseVersion()
      ).toEqual('foo')
    })

    it('returns a string describing the current HEAD if the code has been changed since a release', () => {
      // mock spawnSync('git rev-parse ...') to make isNewVersion always false
      jest.spyOn(child_process, 'spawnSync')
        .mockImplementation(() => ({ status: 0 }))

      const mockExecSync = jest.spyOn(child_process, 'execSync')
        .mockImplementation(() => 'v12.1.0-99-g2ea97da8\n')

      expect(
        createReleaseArchive.getReleaseVersion()
      ).toMatch('12.1.0-99-g2ea97da8')

      expect(mockExecSync).toHaveBeenCalledWith(
        'git describe --tags HEAD', expect.anything()
      )
    })

    // this fails on CI because we do a shallow clone
    testFailingIf(process.env.CI, 'tells us the version number of the release described by a ref', () => {
      expect(
        createReleaseArchive.getReleaseVersion('v12.1.0')
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
      createReleaseArchive.updatePackageJson('package.json', () => { return {} })
      expect(fakeFs['package.json']).toMatch('{}')
    })

    it('preserves the formatting of the package.json file', () => {
      const before = fakeFs['package.json']
      createReleaseArchive.updatePackageJson('package.json', (x) => x)
      expect(fakeFs['package.json']).toMatch(before)
    })

    it('runs npm install after changing the file', () => {
      fakeFs['test/package.json'] = fakeFs['package.json']
      createReleaseArchive.updatePackageJson('test/package.json', () => { return {} })

      expect(mockExecSync).toHaveBeenCalledWith(
        'npm install', expect.objectContaining({ cwd: 'test' })
      )
    })
  })

  describe('archiveReleaseFiles', () => {
    let mockSpawnSync, mockTarCreate

    beforeEach(() => {
      mockSpawnSync = jest.spyOn(child_process, 'spawnSync').mockImplementation(() => ({ status: 0 }))
      mockTarCreate = jest.spyOn(tar, 'create').mockImplementation(() => {})
    })

    it('zips release files by default', () => {
      if (process.platform === 'win32') {
        createReleaseArchive.archiveReleaseFiles({ cwd: 'C:\\tmp', file: 'C:\\test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          '7z', ['a', '-tzip', '-x!test\\node_modules', 'C:\\test.zip', 'test'],
          expect.objectContaining({ cwd: 'C:\\tmp' })
        )
      } else {
        createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: '/test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          'zip', ['--exclude', 'test/node_modules/*', '-r', '/test.zip', 'test'],
          expect.objectContaining({ cwd: '/tmp' })
        )
      }
    })

    it('resolves paths correctly for arguments to zip', () => {
      if (process.platform === 'win32') {
        createReleaseArchive.archiveReleaseFiles({ cwd: 'C:\\tmp', file: 'test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          '7z', ['a', '-tzip', '-x!test\\node_modules', path.join(repoDir, 'test.zip'), 'test'],
          expect.objectContaining({ cwd: 'C:\\tmp' })
        )
      } else {
        createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: 'test.zip', prefix: 'test' })
        expect(mockSpawnSync).toBeCalledWith(
          'zip', ['--exclude', 'test/node_modules/*', '-r', path.join(repoDir, 'test.zip'), 'test'],
          expect.objectContaining({ cwd: '/tmp' })
        )
      }
    })

    it('tars release files if file extension is .tar', () => {
      createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: '/test.tar', prefix: 'test' })
      expect(mockTarCreate).toBeCalledWith(
        expect.objectContaining({ cwd: '/tmp', file: '/test.tar' }),
        ['test']
      )
    })

    it('throws an error if file extension is unrecognised', () => {
      expect(
        () => createReleaseArchive.archiveReleaseFiles({ cwd: '/tmp', file: '/test.8z', prefix: 'test' })
      ).toThrow()
    })
  })
})
