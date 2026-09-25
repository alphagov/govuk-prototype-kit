#!/usr/bin/env node

const { resolve } = require('node:path')
const {writeFileSync} = require('node:fs')

const semver = require('semver')

const { readFileLinesSync, versionIsAPrerelease, getPrereleaseIdentifier, getChangelogLineIndexes } = require('../changelog-release-helper.js')

if (require.main === module) {
  // npm exposes these environment variable as part of the lifecycle hooks
  // (https://github.com/npm/cli/blob/c97b39b1e3436cd20a67ab5f4012a5f395c538b9/workspaces/libnpmversion/lib/version.js#L100-L103)
  const { npm_old_version: previousVersion, npm_new_version: newVersion } =
    process.env

  if (!previousVersion || !newVersion) {
    throw new Error('Both previous and new version must be set to continue.')
  }

  console.log(
    `Updating changelog from version ${previousVersion} to ${newVersion}...`
  )

  // Use `resolve` to find the CHANGELOG.md file relative to the current working directory
  const changelogPath = resolve(process.argv[2] ?? 'CHANGELOG.md')

  updateChangelog(changelogPath, newVersion, previousVersion)
}

/**
 * Update the changelog with a new version heading
 *
 * Inserts a new heading between the 'Unreleased' heading and the most recent
 * content
 *
 * @param {string} path - Path to the CHANGELOG file
 * @param {string} newVersion - New version to add to the changelog
 * @param {string} previousVersion - Previous version. Used for calculating difference
 *   in versions to build the changelog title
 */
function updateChangelog (path, newVersion, previousVersion) {
  const validatedNewVersion = validateVersionNumber(newVersion)
  const validatedPreviousVersion = validateVersionNumber(previousVersion)

  // Skip the entire function if the release version is internal eg: 5.1.0-internal.0
  const newVersionIsAPrerelease = versionIsAPrerelease(validatedNewVersion)
  if (newVersionIsAPrerelease) {
    const identifier = getPrereleaseIdentifier(validatedNewVersion)

    if (identifier === 'internal') {
      console.log(
        'This is an internal release, intended for testing only. The changelog will therefore not be updated.'
      )
      return
    }
  }

  const changelogLines = readFileLinesSync(path)
  const [startIndex] = getChangelogLineIndexes(changelogLines)

  const versionDiff = semver.diff(validatedNewVersion, validatedPreviousVersion)
  if (!versionDiff) {
    throw new Error(`New version (${validatedNewVersion}) and previous version (${validatedPreviousVersion}) are the same`)
  }
  const newVersionTitle = `## ${validatedNewVersion} (${capitalise(convertIncTypeWord(versionDiff, validatedNewVersion))})`

  const newLines = [newVersionTitle, '']
  if (newVersionIsAPrerelease) {
    newLines.push(
      '> [!WARNING]',
      '> This is a prerelease. Do not publish prototypes using this version.',
      `> Use this release to prepare for the changes coming in version \`${removePrereleaseFlag(validatedNewVersion)}\`.`,
      ''
    )
    // Add content for installing pre-releases
    newLines.push(
      'To install this version in an existing prototype:',
      '',
      `- navigate to your prototype folder in a terminal and run the command: \`npm install govuk-prototype-kit@${validatedNewVersion}\``,
      '',
      'To create new prototypes with this version:',
      '',
      '1. Create a new folder for your prototype in a terminal.',
      '2. Navigate to your prototype folder.',
      `3. Run the command \`npx govuk-prototype-kit@${validatedNewVersion} create --version ${validatedNewVersion}\`.`,
      ''
    )
  } else {
    // Add content on how to install the release
    newLines.push(
      'You can find [how to update to the latest version](https://prototype-kit.service.gov.uk/update-to-latest-version/) in our documentation.',
      ''
    )
  }

  // Inject the new lines into the CHANGELOG
  changelogLines.splice(startIndex + 1, 0, '', ...newLines)

  writeFileSync(path, changelogLines.join('\n'))
}

/**
 * Validates the version number that it is a semantic versioned string.
 *
 * @param {string} version - version number
 * @returns {string} - Validated semver of version
 */
function validateVersionNumber (version) {
  const validatedVersion = semver.valid(version)

  if (!validatedVersion) {
    throw new Error(
      `Version number "${version}" could not be parsed as a semantic versioned string.`
    )
  }

  return validatedVersion
}


/**
 * Convert a standard SemVer increment word eg: major, minor or patch into the
 * wording we use for release titles.
 *
 * @param {string} incType - SemVer increment type
 * @param {string|null} version - SemVer version
 * @returns {string} - The reworded increment type
 */
function convertIncTypeWord (incType, version) {
  let rewordedIncType = incType

  // If there's a prerelease flag e.g. 1.0.0-beta.0 use that to decide
  const prereleaseIdentifier = getPrereleaseIdentifier(version)
  if (prereleaseIdentifier) {
    if (prereleaseIdentifier === 'rc') {
      return 'release candidate'
    }
    rewordedIncType = prereleaseIdentifier
  } else if (incType === 'major') {
    rewordedIncType = 'breaking'
  } else if (incType === 'minor') {
    rewordedIncType = 'feature'
  } else if (incType === 'patch') {
    rewordedIncType = 'fix'
  }

  return `${rewordedIncType} release`
}

/**
 * Remove any pre-release flag from a version e.g. 1.0.0-alpha -> 1.0.0
 *
 * @param {string} version - version number
 * @returns {string} - version number without any pre-release flag
 */
function removePrereleaseFlag (version) {
  const parsedVersion = semver.parse(version)
  parsedVersion.prerelease = []
  return parsedVersion.format()
}

/**
 * Capitalise a word or sentance so the first letter is uppercase
 *
 * @param {string} word
 * @returns {string} - capitalised string
 */
function capitalise (word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

module.exports = {
  updateChangelog
}
