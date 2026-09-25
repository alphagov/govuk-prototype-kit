const fs = require('fs')

const { outdent } = require('outdent')

const {
  updateChangelog
} = require('./changelog-release-helper.js')

jest.mock('fs')

const CHANGELOG_FILE_PATH = 'path/to/CHANGELOG.md'

describe('Changelog release helper', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.mocked(fs.readFileSync).mockReturnValue(outdent`
      ## Unreleased

      ### Fixes

      Bing bong

      ## 3.0.0 (Breaking release)
    `)
  })

  describe('Update changelog', () => {
    it('adds a new heading to the changelog for the new version', () => {
      updateChangelog(CHANGELOG_FILE_PATH, '3.1.0', '3.0.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining('## 3.1.0 (Feature release)')
      )
    })

    it('prefixes a new heading with a beta pre-release identifier', () => {
      updateChangelog(CHANGELOG_FILE_PATH, '3.1.0-beta.0', '3.0.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining('## 3.1.0-beta.0 (Beta release)')
      )
    })

    it('prefixes a new heading with a release candidate pre-release identifier', () => {
      updateChangelog(CHANGELOG_FILE_PATH, '3.1.0-rc.0', '3.0.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining('## 3.1.0-rc.0 (Release candidate)')
      )
    })

    it('copies the previous release type if the new version is a prerelease increment', () => {
      jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ### Fixes

        Bing bong

        ## 3.1.0-beta.0 (Beta release)
      `)

      updateChangelog(CHANGELOG_FILE_PATH, '3.1.0-beta.1', '3.1.0-beta.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining('## 3.1.0-beta.1 (Beta release)')
      )
    })

    it('displays a warning to not use non-stable releases in production', () => {
      jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ### Fixes

        Bing bong

        ## 3.1.0-beta.0 (Beta release)
      `)

      updateChangelog(CHANGELOG_FILE_PATH, '3.1.0-beta.1', '3.1.0-beta.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining(outdent`
          ## 3.1.0-beta.1 (Beta release)

          > [!WARNING]
          > This is a prerelease. Do not publish prototypes using this version.
          > Use this release to prepare for the changes coming in version \`3.1.0\`.

          To install this version in an existing prototype:
        `)
      )
    })

    it('does not display a warning when the change is a stable release', () => {
      jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ### Fixes

        Bing bong

        ## 3.1.0 (Feature release)
      `)

      updateChangelog(CHANGELOG_FILE_PATH, '3.1.1', '3.1.0')
      expect(fs.writeFileSync).not.toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining('> [!WARNING]')
      )
    })

    it('has instructions for how to install the release', () => {
      jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ### Fixes

        Bing bong

        ## 3.1.0 (Feature release)
      `)

      updateChangelog(CHANGELOG_FILE_PATH, '3.1.1', '3.1.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        CHANGELOG_FILE_PATH,
        expect.stringContaining(outdent`
            ## 3.1.1 (Fix release)

            You can find [how to update to the latest version](https://prototype-kit.service.gov.uk/update-to-latest-version/) in our documentation.
        `)
      )
    })

    it('does not change the changelog if the provided version is an internal pre-release', () => {
      const consoleLogSpy = jest.spyOn(console, 'log')

      updateChangelog(CHANGELOG_FILE_PATH, '3.1.0-internal.0', '3.0.0')
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'This is an internal release, intended for testing only. The changelog will therefore not be updated.'
      )
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    it('throws an error if the newVersion is not a semantic version string', () => {
      expect(() => {
        updateChangelog(CHANGELOG_FILE_PATH, 'a.b.c', '3.0.0')
      }).toThrow(
        new Error(
          'Version number "a.b.c" could not be parsed as a semantic versioned string.'
        )
      )
    })

    it('throws an error if the previousVersion is not a semantic version string', () => {
      expect(() => {
        updateChangelog(CHANGELOG_FILE_PATH, '3.0.0', 'x.y.z')
      }).toThrow(
        new Error(
          'Version number "x.y.z" could not be parsed as a semantic versioned string.'
        )
      )
    })
  })
})
