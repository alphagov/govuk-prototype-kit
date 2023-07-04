// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const { startPerformanceTimer, endPerformanceTimer } = require('../utils/performance')
const { packageDir, projectDir } = require('../utils/paths')
const { requestHttpsJson } = require('../utils/requestHttps')
const { verboseLog } = require('../utils/verboseLogger')
const knownPlugins = require(path.join(packageDir, 'known-plugins.json'))
const projectPackage = require(path.join(projectDir, 'package.json'))
const config = require('../config')
const { getConfigForPackage } = require('../utils/requestHttps')
const { getProxyPluginConfig } = require('./plugin-utils')

let packageTrackerInterval

const packagesCache = {}

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

async function refreshPackageInfo (packageName, version) {
  const packageDir = path.join(projectDir, 'node_modules', packageName)
  const pluginConfigFile = path.join(packageDir, 'govuk-prototype-kit.config.json')

  const requiredPlugins = knownPlugins?.plugins?.required || []

  const required = (!(packageName === 'govuk-frontend' && config.getConfig().allowGovukFrontendUninstall)) && requiredPlugins.includes(packageName)

  let [
    packageJson,
    pluginConfig,
    registryInfo
  ] = await Promise.all([
    readJson(path.join(packageDir, 'package.json')),
    readJson(pluginConfigFile),
    requestRegistryInfo(packageName)
  ])

  if ([packageJson, pluginConfig, registryInfo, version].every(val => !val)) {
    return undefined
  }

  const latestVersion = registryInfo ? registryInfo['dist-tags']?.latest : undefined
  const versions = registryInfo ? Object.keys(registryInfo.versions) : []

  const installedPackageVersion = projectPackage.dependencies[packageName]
  const installed = !!installedPackageVersion
  const installedLocally = installedPackageVersion?.startsWith('file:')

  let localVersion

  if (!installed) {
    // Retrieve the packageJson and pluginConfig from the registry if possible
    if (registryInfo) {
      packageJson = registryInfo?.versions ? registryInfo?.versions[latestVersion] : undefined
      pluginConfig = await getConfigForPackage(packageName)
    } else if (version) {
      packageJson = await readJson(path.join(path.relative(projectDir, version), 'package.json'))
      pluginConfig = await readJson(path.join(path.relative(projectDir, version), 'govuk-prototype-kit.config.json'))
      if (packageJson) {
        localVersion = version
      } else {
        return undefined
      }
    }
  }

  const available = !!knownPlugins?.plugins?.available.includes(packageName)

  if (!pluginConfig && getProxyPluginConfig(packageName)) {
    // Use the proxy pluginConfig if exists when no other plugin config can be found
    pluginConfig = getProxyPluginConfig(packageName)
  }

  const { version: installedVersion } = installed ? packageJson : {}
  if (installedLocally) {
    localVersion = path.resolve(installedPackageVersion.replace('file:', ''))
  }

  const pluginDependencies = pluginConfig?.pluginDependencies

  const packageInfo = {
    packageName,
    installed,
    installedVersion,
    installedLocally,
    available,
    required,
    latestVersion,
    versions,
    packageJson,
    pluginConfig,
    pluginDependencies,
    localVersion,
    installedPackageVersion
  }

  // Remove all undefined properties and save to cache
  packagesCache[packageName] = Object.fromEntries(Object.entries(packageInfo).filter(([_, value]) => value !== undefined))
}

async function lookupPackageInfo (packageName, version) {
  if (!packagesCache[packageName]) {
    await refreshPackageInfo(packageName, version)
  }
  return packagesCache[packageName]
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
    // If the packageTrackerInterval has been set, then packages cache has been populated at least once
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
    .filter(({ pluginDependencies }) => pluginDependencies?.some((pluginDependency) => pluginDependency === packageName || pluginDependency.packageName === packageName))
}

async function getDependencyPackages (packageName, version) {
  if (!Object.keys(packagesCache).length) {
    await startPackageTracker()
  }
  await waitForPackagesCache()
  const pkg = await lookupPackageInfo(packageName, version)
  return !pkg?.pluginDependencies
    ? []
    : await Promise.all(pkg.pluginDependencies.map((pluginDependency) => {
      return typeof pluginDependency === 'string' ? lookupPackageInfo(pluginDependency) : lookupPackageInfo(pluginDependency.packageName)
    }))
}

if (!config.getConfig().isTest) {
  startPackageTracker()
}

function setPackagesCache (packagesInfo) {
  // Only used for unit tests
  while (packagesCache.length) {
    packagesCache.pop()
  }
  packagesInfo.forEach((packageInfo) => {
    packagesCache[packageInfo.packageName] = packageInfo
  })
  packageTrackerInterval = true
}

module.exports = {
  setPackagesCache, // Only for unit testing purposes
  waitForPackagesCache,
  lookupPackageInfo,
  getInstalledPackages,
  getAvailablePackages,
  getDependentPackages,
  getDependencyPackages
}
