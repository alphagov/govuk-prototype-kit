#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

const { fetchOriginal, getProjectVersion, normaliseLineEndings } = require('./util')
const { projectDir: prototypeToUpdate } = require('../path-utils')

const updateDir = path.join(prototypeToUpdate, 'update')

async function updatePackageJson () {
  const userVersion = await getProjectVersion()

  const originalPackageJson = await fetchOriginal(userVersion, 'package.json')
  const theirPackageJson = await fs.readFile(
    path.join(prototypeToUpdate, 'package.json'), 'utf8')
  const ourPackageJson = await fs.readFile(
    path.join(updateDir, 'package.json'), 'utf8')

  // If the user hasn't changed the file we don't need to prepatch ours, so do nothing
  if (theirPackageJson === originalPackageJson) {
    return
  }

  const merged = await mergePackageJson(
    JSON.parse(theirPackageJson),
    JSON.parse(originalPackageJson),
    JSON.parse(ourPackageJson)
  )

  const [mergedPackageJson] = normaliseLineEndings(theirPackageJson,
    JSON.stringify(merged, null, 2) + '\n')

  await fs.writeFile(path.join(updateDir, 'package.json'), mergedPackageJson, 'utf8')
}

function mergePackageJson (theirs, original, ours) {
  return {
    ...ours,
    dependencies: mergeDeps(
      theirs.dependencies,
      original.dependencies,
      ours.dependencies
    )
  }
}

/*
 * Merge changes from original to ours into theirs
 *
 */
function mergeDeps (theirs, original, ours) {
  let merged = { ...theirs, ...ours }

  // If a user has downgraded a package, we respect that...
  for (const pkg in original) {
    if (pkg in theirs && theirs[pkg] !== original[pkg]) {
      merged[pkg] = theirs[pkg]
    }
  }

  // ...but we delete packages we have deleted
  for (const pkg in original) {
    if (pkg in ours === false) {
      delete merged[pkg]
    }
  }

  // npm sorts the dependencies, so we should too, but the way npm sorts the
  // dependencies varies from version to version. We want the order of the
  // merged dependencies to match the order of `ours` as much as possible, so
  // we sort them twice, once alphabetically, and once to shuffle any items
  // that are out-of-order compared to `ours`.
  const ourPackageOrder = Object.fromEntries(
    [...Object.keys(ours).entries()].map(([i, p]) => [p, i])
  )
  const mergedPackageNames = Object.keys(merged)
    .sort()
    .sort((a, b) => {
      if (ourPackageOrder[a] && ourPackageOrder[b]) {
        return ourPackageOrder[a] - ourPackageOrder[b]
      } else {
        return 0
      }
    })
  merged = Object.fromEntries(
    mergedPackageNames.map(name => [name, merged[name]])
  )

  return merged
}

module.exports = {
  updatePackageJson,
  // export for tests
  mergeDeps,
  mergePackageJson
}
