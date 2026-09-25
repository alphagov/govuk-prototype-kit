#!/usr/bin/env node
const {resolve} = require('path')

/**
 * Extracts the release notes from a CHANGELOG file
 */
const { generateReleaseNotes } = require('../changelog-release-helper.js')

const changelogPath = resolve(process.argv[2] ?? 'CHANGELOG.md')

generateReleaseNotes(changelogPath, process.env.PACKAGE_VERSION, { actor: process.env.GITHUB_ACTOR, runId: process.env.GITHUB_RUN_ID })