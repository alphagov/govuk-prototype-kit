// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const { startPerformanceTimer, endPerformanceTimer } = require('../utils/performance')
const { packageDir, projectDir } = require('../utils/paths')
const { requestHttpsJson } = require('../utils/requestHttps')
const { verboseLog } = require('./verboseLogger')
const knownPlugins = require(path.join(packageDir, 'known-plugins.json'))
const projectPackage = require(path.join(projectDir, 'package.json'))
const config = require('../config')

let packageTrackerInterval

const packagesInfo = {}

// This allows npm modules to act as if they are plugins by providing the plugin config for them
const proxyPluginConfig = {
  jquery: {
    scripts: ['/dist/jquery.js'],
    assets: ['/dist']
  }
}

function startPackageTracker () {
  updatePackagesInfo().then(() => {
    packageTrackerInterval = setInterval(updatePackagesInfo, 36000)
  })
}

async function updatePackagesInfo () {
  const availablePlugins = knownPlugins?.plugins?.available || []
  const packagesRequired = [...availablePlugins, ...Object.keys(projectPackage.dependencies)]
  packagesRequired.map(async (packageName) => refreshPackageInfo(packageName))
}

async function readJson (filename) {
  return await fse.pathExists(filename) ? fse.readJson(filename) : undefined
}

async function requestRegistryInfo (packageName) {
  const timer = startPerformanceTimer()
  try {
    const registryInfoUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`
    verboseLog(`looking up ${registryInfoUrl}`)
    const registryInfo = await requestHttpsJson(registryInfoUrl)
    endPerformanceTimer('lookupPackageInfo (success)', timer)
    return registryInfo
  } catch (e) {
    endPerformanceTimer('lookupPackageInfo (failure)', timer)
    verboseLog('ignoring error', e.message)
    return undefined
  }
}

async function refreshPackageInfo (packageName) {
  const packageDir = path.join(projectDir, 'node_modules', packageName)
  const pluginConfigFile = path.join(packageDir, 'govuk-prototype-kit.config.json')

  const mandatoryPlugins = knownPlugins?.plugins?.mandatory || []

  const mandatory = (!(packageName === 'govuk-frontend' && config.getConfig().allowGovukFrontendUninstall)) && mandatoryPlugins.includes(packageName)

  let [
    packageJson,
    pluginConfig,
    registryInfo
  ] = await Promise.all([
    readJson(path.join(packageDir, 'package.json')),
    readJson(pluginConfigFile),
    requestRegistryInfo(packageName)
  ])

  const latestVersion = registryInfo ? registryInfo['dist-tags']?.latest : undefined

  const installedVersion = projectPackage.dependencies[packageName]
  const installed = !!installedVersion
  const installedLocally = installedVersion?.startsWith('file:')

  if (!installed) {
    // Retrieve the packageJson and pluginConfig from the registry if possible
    if (registryInfo) {
      packageJson = registryInfo?.versions ? registryInfo?.versions[latestVersion] : undefined
    }
  }

  const available = !!knownPlugins?.plugins?.available.includes(packageName)

  if (!pluginConfig && proxyPluginConfig[packageName]) {
    // Use the proxy pluginConfig if exists when no other plugin config can be found
    pluginConfig = proxyPluginConfig[packageName]
  }

  packagesInfo[packageName] = {
    ...registryInfo,
    name: packageName,
    installed,
    installedVersion,
    installedLocally,
    available,
    mandatory,
    latestVersion,
    packageJson,
    pluginConfig
  }
}

async function lookupPackageInfo (packageName) {
  if (!packagesInfo[packageName]) {
    await refreshPackageInfo(packageName)
  }
  return packagesInfo[packageName]
}

function stopPackageTracker () {
  if (packageTrackerInterval) {
    clearInterval(packageTrackerInterval)
  }
}

async function getInstalledPackages () {
  return Object.values(packagesInfo).filter(({ installed }) => installed)
}

async function getAvailablePackages () {
  return Object.values(packagesInfo).filter(({
    available,
    installed
  }) => available && !installed)
}

if (!config.getConfig().isTest) {
  startPackageTracker()
}

module.exports = {
  lookupPackageInfo,
  getInstalledPackages,
  getAvailablePackages,
  stopPackageTracker
}
