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

const packagesCache = {}

// This allows npm modules to act as if they are plugins by providing the plugin config for them
const proxyPluginConfig = {
  jquery: {
    scripts: ['/dist/jquery.js'],
    assets: ['/dist']
  }
}

async function startPackageTracker () {
  await updatePackagesInfo()
  packageTrackerInterval = setInterval(updatePackagesInfo, 36000)
}

async function updatePackagesInfo () {
  const availablePlugins = knownPlugins?.plugins?.available || []
  const packagesRequired = [...availablePlugins, ...Object.keys(projectPackage.dependencies)]
  return Promise.all(packagesRequired.map(async (packageName) => refreshPackageInfo(packageName)))
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
    verboseLog(`retrieved ${registryInfoUrl}`)
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

  if ([packageJson, pluginConfig, registryInfo].every(val => val === undefined)) {
    return undefined
  }

  const latestVersion = registryInfo ? registryInfo['dist-tags']?.latest : undefined
  const versions = registryInfo ? Object.keys(registryInfo.versions) : []

  const installedPackageVersion = projectPackage.dependencies[packageName]
  const installed = !!installedPackageVersion
  const installedLocally = installedPackageVersion?.startsWith('file:')

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

  const { version: installedVersion } = installed ? packageJson : {}

  const pluginDependencies = packageJson?.peerDependencies

  const packageInfo = {
    packageName,
    installed,
    installedVersion,
    installedLocally,
    available,
    mandatory,
    latestVersion,
    versions,
    packageJson,
    pluginConfig,
    pluginDependencies
  }

  // Remove all undefined properties and save to cache
  packagesCache[packageName] = Object.fromEntries(Object.entries(packageInfo).filter(([_, value]) => value !== undefined))
}

async function lookupPackageInfo (packageName) {
  if (!packagesCache[packageName]) {
    await refreshPackageInfo(packageName)
  }
  return packagesCache[packageName]
}

function stopPackageTracker () {
  if (packageTrackerInterval) {
    clearInterval(packageTrackerInterval)
  }
}

const basePlugins = config.getConfig().basePlugins

function emphasizeBasePlugins (plugins, nextPlugin) {
  if (basePlugins.includes(nextPlugin.packageName)) {
    return [nextPlugin, ...plugins]
  } else {
    return [...plugins, nextPlugin]
  }
}

function packageNameSort (pkgA, pkgB) {
  const nameA = pkgA.packageName.toLowerCase()
  const nameB = pkgB.packageName.toLowerCase()
  if (nameA > nameB) return 1
  if (nameA < nameB) return -1
  return 0
}

async function getInstalledPackages () {
  if (!Object.keys(packagesCache).length) {
    await startPackageTracker()
  }
  await waitForPackagesCache()
  return Object.values(packagesCache)
    .filter(({ installed }) => installed)
    .sort(packageNameSort)
    .reduce(emphasizeBasePlugins, [])
}

async function getAvailablePackages () {
  if (!Object.keys(packagesCache).length) {
    await startPackageTracker()
  }
  await waitForPackagesCache()
  return Object.values(packagesCache)
    .filter(({ available, installed }) => available && !installed)
    .sort(packageNameSort)
    .reduce(emphasizeBasePlugins, [])
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForPackagesCache () {
  let numberOfRetries = 20
  let waiting = !packageTrackerInterval
  while (waiting) {
    waiting = !packageTrackerInterval && numberOfRetries > 0
    numberOfRetries--
    if (numberOfRetries === 0) {
      console.log('Failed to load the package cache')
    } else {
      await sleep(250)
    }
  }
}

async function getDependentPackages (packageName) {
  if (!Object.keys(packagesCache).length) {
    await startPackageTracker()
  }
  await waitForPackagesCache()
  return Object.values(packagesCache)
    .filter(({ pluginDependencies }) => pluginDependencies && Object.keys(pluginDependencies).includes(packageName))
}

async function getDependencyPackages (packageName) {
  if (!Object.keys(packagesCache).length) {
    await startPackageTracker()
  }
  await waitForPackagesCache()
  const pkg = packagesCache[packageName]
  return pkg.pluginDependencies ? await Promise.all(Object.keys(pkg.pluginDependencies).map(lookupPackageInfo)) : []
}

if (!config.getConfig().isTest) {
  startPackageTracker()
}

module.exports = {
  waitForPackagesCache,
  lookupPackageInfo,
  getInstalledPackages,
  getAvailablePackages,
  getDependentPackages,
  getDependencyPackages,
  stopPackageTracker
}
