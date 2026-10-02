const { readFileSync } = require('fs')

const semver = require('semver')

/**
 * Synchronously reads the content of the given file into an array of lines
 *
 * @param {string} path - Path to the file to read
 * @returns {Array<string>} - Changelog split into an array by lines
 */
function readFileLinesSync (path) {
  return readFileSync(path, 'utf8').split('\n')
}

/**
 * Gets the start and end headings in the changelog for processing by the
 * exported functions
 *
 * @param {Array<string>} changelogLines - Produced from getChangelogLines
 * @param {string|undefined} heading - Optional query to look for heading
 *   where the first index is pulled from eg: 'Unreleased'
 * @returns {Array<number>} - Indexes in the changelog identifying start and end lines
 */
function getChangelogLineIndexes (changelogLines, heading = undefined) {
  const startHeading = `## ${heading ?? 'Unreleased'}`

  const startIndex = changelogLines
    .findIndex((line) => line.startsWith(startHeading))

  if (startIndex === -1) {
    throw new Error(`Could not find ${startHeading} in CHANGELOG lines`)
  }

  const endIndex = changelogLines
    .slice(startIndex + 1) // Start next line from the start heading
    .findIndex((line) => line.startsWith('## '))

  if (endIndex === -1) {
    throw new Error(`Could not find heading after line ${startIndex} in CHANGELOG`)
  }

  return [startIndex, startIndex + endIndex + 1]
}

/**
 * Checks if a version string is a pre-release or not
 *
 * Returns true only if a semver is a pre-release with an identifier and an
 * identifier base, eg:
 *
 * - 4.0.0 - false
 * - 4.0.0-beta false
 * - 4.0.0-0 false
 * - 4.0.0.beta.0 true
 *
 * @param {string} version
 * @returns {boolean} - If the passed version is a pre-release or not
 */
function versionIsAPrerelease (version) {
  return /^\d+\.\d+\.\d+-\D+\.\d+$/i.test(version)
}

/**
 * Get the identifier and identifier base of a pre-release semver
 *
 * @param {string} version
 * @returns {string} - the identifier of the pre-release
 */
function getPrereleaseIdentifier (version) {
  if (!versionIsAPrerelease(version)) {
    return ''
  }
  // Prerelease is made up of an optional string label and a number increment
  // e.g. `1.0.0-beta.0` and `1.0.0-0`, so only return something if we find a label
  const prereleaseIdentifier = semver
    .prerelease(version)
    .find((part) => typeof part === 'string')
  if (!prereleaseIdentifier) {
    return ''
  }
  return prereleaseIdentifier
}

module.exports = {
  versionIsAPrerelease,
  getPrereleaseIdentifier,
  readFileLinesSync,
  getChangelogLineIndexes
}
