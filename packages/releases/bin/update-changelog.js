#!/usr/bin/env node

const { resolve } = require('node:path')
const { writeFileSync, readFileSync } = require('node:fs')

const { getChangelogLineIndexes } = require('../changelog-release-helper.js')

const config = require('../config.js')
const { VersionBump } = require('../version-bump.js')

if (require.main === module) {
  // npm exposes these environment variable as part of the lifecycle hooks
  // (https://github.com/npm/cli/blob/c97b39b1e3436cd20a67ab5f4012a5f395c538b9/workspaces/libnpmversion/lib/version.js#L100-L103)
  const { npm_old_version: previousVersion, npm_new_version: newVersion } =
    process.env

  const bump = new VersionBump(newVersion, previousVersion)

  console.log(
    `Updating changelog from version ${previousVersion} to ${newVersion}...`
  )

  // Use `resolve` to find the CHANGELOG.md file relative to the current working directory
  const changelogPath = resolve(process.argv[2] ?? 'CHANGELOG.md')

  updateChangelog(changelogPath, bump)
}

/**
 * Update the changelog with a new version heading
 *
 * Inserts a new heading between the 'Unreleased' heading and the most recent
 * content
 *
 * @param {string} path - Path to the CHANGELOG file
 * @param {VersionBump} bump - New version to add to the changelog
 */
function updateChangelog (path, bump) {
  if (!bump.needsChangelogUpdate) {
    console.log('This is an internal release, intended for testing only. The changelog will therefore not be updated.')
    return
  }

  updateFile(path, (content) => {
    const changelogLines = content.split('\n')

    const [startIndex] = getChangelogLineIndexes(changelogLines)

    const newVersionTitle = `## v${bump.newVersion} (${capitalise(bump.releaseLabel)})`

    const newLines = [newVersionTitle, '']
    if (bump.toPrerelease) {
      newLines.push(
        config.prereleaseWarning(bump.withoutPrereleaseTag),
        ''
      )
      // Add content for installing pre-releases
      newLines.push(
        config.prereleaseInstallationInstructions(bump.newVersion),
        ''
      )
    } else {
      // Add content on how to install the release
      newLines.push(
        config.installationInstructions(),
        ''
      )
    }

    // Inject the new lines into the CHANGELOG
    changelogLines.splice(startIndex + 1, 0, '', ...newLines)

    return changelogLines.join('\n')
  })
}

/**
 * Updates file at given path with the result from the given function
 *
 * @param {string} path - The path of the file to update
 * @param {string => string | null | undefined} callback - The function updating the content
 */
function updateFile (path, callback) {
  const content = readFileSync(path, { encoding: 'utf-8' })
  const updatedContent = callback(content)
  if (updatedContent) {
    writeFileSync(path, updatedContent)
  }
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
