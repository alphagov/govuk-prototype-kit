const fs = require('node:fs')

const { outdent } = require('outdent')

const { generateReleaseNotes } = require('./extract-release-notes.js')

jest.mock('fs')

const CHANGELOG_FILE_PATH = '/path/to/changelog'

describe('generateReleaseNotes', () => {
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

  it('writes release notes from the changelog from the last version heading', () => {
    jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ## 3.1.0 (Feature release)

        ### Fixes

        Bing bong

        ## 3.0.0 (Breaking release)
        `)

    generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './release-notes-body',
      expect.stringContaining('Bing bong')
    )
  })

  it('writes release notes from the changelog from the last version heading if that version is a pre-release', () => {
    jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ## 3.1.0-beta.0 (Feature release)

        ### Fixes

        Bing bong

        ## 3.0.0 (Breaking release)
        `)

    generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0-beta.0')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './release-notes-body',
      expect.stringContaining('Bing bong')
    )
  })

  it('writes release notes from the changelog from the Unreleased heading if the version is internal', () => {
    generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0-internal.0')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './release-notes-body',
      expect.stringContaining('Bing bong')
    )
  })

  it('increases the heading levels from the changelog by one', () => {
    generateReleaseNotes(CHANGELOG_FILE_PATH, 'Unreleased')
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
    generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0-internal.0', {
      actor: 'bingbong',
      runId: '12345'
    })
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './release-notes-body',
      expect.stringContaining(
        'Pull request generated on behalf of @bingbong by [run 12345](https://github.com/alphagov/govuk-prototype-kit/actions/runs/12345) of the [Build release workflow](https://github.com/alphagov/govuk-prototype-kit/actions/workflows/build-release.yml)'
      )
    )
  })
})
