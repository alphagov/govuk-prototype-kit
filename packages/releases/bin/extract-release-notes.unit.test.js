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

    const releaseNotes = generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0')
    expect(releaseNotes).toContain('Bing bong')
  })

  it('writes release notes from the changelog from the last version heading if that version is a pre-release', () => {
    jest.mocked(fs.readFileSync).mockReturnValue(outdent`
        ## Unreleased

        ## 3.1.0-beta.0 (Feature release)

        ### Fixes

        Bing bong

        ## 3.0.0 (Breaking release)
        `)

    const releaseNotes = generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0-beta.0')
    expect(releaseNotes).toContain('Bing bong')
  })

  it('writes release notes from the changelog from the Unreleased heading if the version is internal', () => {
    const releaseNotes = generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0-internal.0')
    expect(releaseNotes).toContain('Bing bong')
  })

  it('increases the heading levels from the changelog by one', () => {
    const releaseNotes = generateReleaseNotes(CHANGELOG_FILE_PATH, 'Unreleased')
    // The release notes should no longer contain the original heading
    expect(releaseNotes).not.toContain('### Fixes')
    // But one level up
    expect(releaseNotes).toContain('## Fixes')
  })

  it('adds a note on the generation workflow if options param provided', () => {
    const releaseNotes = generateReleaseNotes(CHANGELOG_FILE_PATH, '3.1.0-internal.0', {
      actor: 'bingbong',
      runId: '12345'
    })
    expect(releaseNotes).toContain(
      'Pull request generated on behalf of @bingbong by [run 12345](https://github.com/alphagov/govuk-prototype-kit/actions/runs/12345) of the [Build release workflow](https://github.com/alphagov/govuk-prototype-kit/actions/workflows/build-release.yml)'
    )
  })
})
