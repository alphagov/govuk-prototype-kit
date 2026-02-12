// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

const config = require('./config').getConfig()
const { pluginVersionSatisfies } = require('./plugins/packages.js')

/**
 * Find GOV.UK Frontend via search paths
 *
 * @param {string[]} searchPaths - Search paths for `require.resolve()`
 * @returns {GOVUKFrontendPaths}
 */
function govukFrontendPaths (searchPaths = []) {
  /**
   * GOV.UK Frontend paths normalised
   *
   * v4.x - `/path/to/node_modules/govuk-frontend/govuk/all.js`
   * v5.x - `/path/to/node_modules/govuk-frontend/dist/govuk/all.bundle.js`
   */
  const entryPath = require.resolve('govuk-frontend', { paths: searchPaths })
  const dependencyPath = path.join('node_modules/govuk-frontend')
  const baseDir = path.join(entryPath.split(dependencyPath)[0], dependencyPath)
  const includeDir = path.dirname(entryPath)
  // fragment of the complete asset path. Is either 'assets' or 'assets/rebrand'
  // depending on if the app config rebrand options are set and running a version of GOV.UK Frontend
  // supporting both rebranded and non rebranded assets
  let assetPathFragment = 'assets'
  if (pluginVersionSatisfies('govuk-frontend', '<6.0.0') && config?.plugins?.['govuk-frontend']?.rebrand) {
    assetPathFragment = 'assets/rebrand'
  }

  return {
    baseDir,

    includePath: `/${path.relative(baseDir, includeDir)}`,
    assetPath: `/${path.relative(baseDir, path.join(includeDir, assetPathFragment))}`,

    // GOV.UK Frontend plugin config
    config: fse.readJsonSync(path.join(baseDir, 'govuk-prototype-kit.config.json'), { throws: false }) ?? {
      nunjucksPaths: [],
      sass: []
    }
  }
}

module.exports = {
  govukFrontendPaths
}

/**
 * GOV.UK Frontend paths object
 *
 * @typedef {object} GOVUKFrontendPaths
 * @property {string} baseDir - GOV.UK Frontend directory path
 * @property {URL["pathname"]} includePath - URL path to GOV.UK Frontend includes
 * @property {URL["pathname"]} assetPath - URL path to GOV.UK Frontend assets
 * @property {import('./plugins/plugins').ConfigManifest} config - GOV.UK Frontend plugin config
 */
