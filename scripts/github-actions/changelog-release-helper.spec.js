const fs = require('fs')

const {
  validateVersion,
  updateChangelog,
  generateReleaseNotes
} = require('./changelog-release-helper.mjs')

jest.mock('fs')

describe('Changelog release helper', () => {
  beforeEach(() => {
    jest.mocked(fs.readFileSync).mockReturnValue(`
      ## Unreleased

      ### Fixes

      Bing bong

      ## 3.0.0
    `)
  })

  describe('Validate version', () => {
    it('runs normally if a valid new version is parsed to it', () => {
      expect(() => validateVersion('3.1.0', '3.0.0')).not.toThrow()
    })

    it('throws an error if an invalid semver is parsed', () => {
      expect(() => validateVersion('pizza', '3.0.0')).toThrow(
        'New version number pizza could not be processed by Semver. Please ensure you are providing a valid semantic version'
      )
    })

    it('throws an error if new version is less than old version', () => {
      expect(() => validateVersion('2.11.0', '3.0.0')).toThrow(
        'New version number 2.11.0 is less than or equal to the most recent version (3.0.0). Please provide a newer version number'
      )
    })

    it('throws an error if the previous version is falsy or invalid', () => {
      expect(() => validateVersion('3.1.0', 'pizza')).toThrow(
        'Previous version number pizza could not be processed by Semver. Please ensure a valid version is being passed to the script via the govuk-frontend package.json package.'
      )
    })

    it.each([
      {
        badVersion: '5.0.0',
        type: 'major',
        goodVersion: '4.0.0'
      },
      {
        badVersion: '3.2.0',
        type: 'minor',
        goodVersion: '3.1.0'
      },
      {
        badVersion: '3.0.2',
        type: 'patch',
        goodVersion: '3.0.1'
      },
      {
        badVersion: '3.0.2-beta.0',
        type: 'prepatch',
        goodVersion: '3.0.1-beta.0'
      },
      {
        badVersion: '3.0.2',
        type: 'patch',
        goodVersion: '3.0.1',
        customVersion: '3.0.1-beta.15'
      }
    ])(
      'throws an error if new version is more than one possible `$type` increment',
      ({ badVersion, type, goodVersion, customVersion }) => {
        expect(() =>
          validateVersion(badVersion, customVersion ?? '3.0.0')
        ).toThrow(
          `New version number ${badVersion} is incrementing more than one for its increment type (${type}). Please provide a version number than only increments by one from the current version. In this case, it's likely that your new version number should be: ${goodVersion}`
        )
      }
    )
  })

  describe('Update changelog', () => {
    it('adds a new heading to the changelog for the new version', () => {
      updateChangelog('3.1.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './CHANGELOG.md',
        expect.stringContaining('## 3.1.0')
      )
    })
  })

  describe('Generate release notes', () => {
    it('writes release notes from the changelog from the last version heading', () => {
      jest.mocked(fs.readFileSync).mockReturnValue(`
        ## Unreleased

        ## v3.1.0 (Feature release)

        ### Fixes

        Bing bong

        ## v3.0.0 (Breaking release)
      `)

      generateReleaseNotes('3.1.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('Bing bong')
      )
    })

    it('writes release notes from the changelog from the last version heading if that version is a pre-release', () => {
      jest.mocked(fs.readFileSync).mockReturnValue(`
        ## Unreleased

        ## v3.1.0-beta.0 (Feature release)

        ### Fixes

        Bing bong

        ## v3.0.0 (Breaking release)
      `)

      generateReleaseNotes('3.1.0-beta.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('Bing bong')
      )
    })

    it('writes release notes from the changelog from the Unreleased heading if the version is internal', () => {
      generateReleaseNotes('3.1.0-internal.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('Bing bong')
      )
    })

    it('increases the heading levels from the changelog by one', () => {
      generateReleaseNotes('Unreleased')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('## Fixes')
      )
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.not.stringContaining('### Fixes')
      )
    })

    it('adds a note on the generation workflow if options param provided', () => {
      generateReleaseNotes('3.1.0-internal.0', {
        actor: 'bingbong',
        runId: '12345'
      })
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining(
          'Pull request generated on behalf of @bingbong by [run 12345](https://github.com/alphagov/govuk-frontend/actions/runs/12345) of the [Build release workflow](https://github.com/alphagov/govuk-frontend/actions/workflows/build-release.yml)'
        )
      )
    })
  })
})
