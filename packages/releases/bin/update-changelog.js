#!/usr/bin/env node

const { resolve } = require('path')

const { updateChangelog } = require('../changelog-release-helper.js')

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
