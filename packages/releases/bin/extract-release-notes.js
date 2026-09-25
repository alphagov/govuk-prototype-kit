#!/usr/bin/env node
const { resolve } = require('node:path')
const {writeFileSync} = require('node:fs')

/**
 * Extracts the release notes from a CHANGELOG file
 */
const { readFileLinesSync, versionIsAPrerelease, getPrereleaseIdentifier, getChangelogLineIndexes } = require('../changelog-release-helper.js')

if (require.main === module) {
    (async () => {
      const changelogPath = resolve(process.argv[2] ?? 'CHANGELOG.md')

      process.stdout.write(generateReleaseNotes(changelogPath, process.env.PACKAGE_VERSION, { actor: process.env.GITHUB_ACTOR, runId: process.env.GITHUB_RUN_ID }))``
    })   
}

/**
 * Generates release notes from the most recent changelog
 *
 * Creates a text file 'release-notes-body' from the content between either the
 * release heading passed to it by newVersion or the 'Unreleased' heading and the
 * following release heading if newVersion is tagged as internal
 *
 * @param {string} path - Path to the CHANGELOG file
 * @param {string} newVersion - Version used to find start point for release notes
 * @param {object} [options] - Release notes options
 * @param {string} [options.actor] - Github username of user who ran workflow
 * @param {string} [options.runId] - ID of Build release workflow to reference
 * @returns {string} The extracted release notes
 */
function generateReleaseNotes (path, newVersion, options) {
  // Get the identifier from the version if there is one as we'll use this to
  // change what we pass to getChangelogLineIndexes if the version has an
  // 'internal' tag
  const identifier = versionIsAPrerelease(newVersion)
    ? getPrereleaseIdentifier(newVersion)
    : undefined
  const changelogLines = readFileLinesSync(path)
  const [startIndex, previousReleaseLineIndex] = getChangelogLineIndexes(
    changelogLines,
    identifier === 'internal' ? undefined : newVersion
  )

  const releaseNotes = changelogLines
    .slice(startIndex + 1, previousReleaseLineIndex - 1)
    .map((line) =>
      line.replace(/^\s+/, '').startsWith('##')
        ? line.replace(/^\s+/, '').substring(1)
        : line
    )

  if (options && options.actor && options.runId) {
    releaseNotes.push('')
    releaseNotes.push(
      `Pull request generated on behalf of @${options.actor} by [run ${options.runId}](https://github.com/alphagov/govuk-prototype-kit/actions/runs/${options.runId}) of the [Build release workflow](https://github.com/alphagov/govuk-prototype-kit/actions/workflows/build-release.yml)`
    )
  }

  return releaseNotes.join('\n')
}

module.exports = {
  generateReleaseNotes
}
