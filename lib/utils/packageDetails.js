const fsp = require('fs').promises
const path = require('path')
const fse = require('fs-extra')
const requestHttps = require('./requestHttps')
const { preparePackageNameForDisplay } = require('../plugins/plugins')
const { projectDir } = require('./paths')
const encode = encodeURIComponent
const { plugins: { available: availablePlugins, proxyConfig: pluginProxyConfig } } = require('../../known-plugins.json')
const { cacheFunctionCalls } = require('./functionCache')

const nodeModulesDir = path.join(projectDir, 'node_modules')
const packageJsonFilePath = path.join(projectDir, 'package.json')
const contextPath = 'manage-prototype'
const doesntExistResponse = {
  exists: false
}

const encodeRef = ref => encode(ref).replaceAll('%3A', ':')

const requestJson = cacheFunctionCalls((url) => requestHttps.requestHttpsJson(url), { maxTimeMinutes: 20 })

async function getPluginDetailsFromNpm (packageName, version) {
  if (!version) {
    throw new Error('No version specified, version must be specified')
  }
  let registerEntry
  try {
    registerEntry = await requestJson(`https://registry.npmjs.org/${encode(packageName)}`)
  } catch (e) {
    if (e.statusCode === 404) {
      return doesntExistResponse
    }
    throw e
  }
  const versionConfig = registerEntry.versions[version]
  if (versionConfig) {
    const npmIdentifier = `${registerEntry.name}@${version}`
    return await addStandardDetails({
      exists: true,
      packageName: registerEntry.name,
      version,
      releaseDateTime: registerEntry.time[version],
      npmIdentifier,
      legacyInstallQueryString: `?package=${encode(packageName)}&version=${encode(version)}`,
      internalRef: `npm:${packageName}:${version}`,
      origin: 'NPM',
      pluginConfig: await requestHttps.getPluginConfigContentsFromNodeModule(versionConfig.dist.tarball)
    })
  } else {
    return doesntExistResponse
  }
}

async function getLatestPluginDetailsFromNpm (packageName) {
  let result
  try {
    const registerEntry = await requestJson(`https://registry.npmjs.org/${encode(packageName)}`)
    result = await self.getPluginDetailsFromNpm(packageName, registerEntry['dist-tags'].latest)
  } catch (e) {
    if (e.statusCode === 404) {
      return doesntExistResponse
    }
    throw e
  }
  result.internalRef = `npm:${result.packageName}`
  return addStandardDetails(result)
}

async function getPluginDetailsFromGithub (org, project, branch) {
  let githubDetails
  try {
    githubDetails = await requestJson(`https://api.github.com/repos/${encode(org)}/${encode(project)}`)
  } catch (e) {
    if (e.statusCode === 404) {
      return doesntExistResponse
    }
    console.log('Unexpected error when looking up in Github', e)
    throw e
  }
  const chosenBranch = branch || githubDetails.default_branch
  const updatedTimePromise = requestJson(githubDetails.branches_url.replace('{/branch}', '/' + chosenBranch))
    .then(x => x.commit.commit.author.date)
    .catch(_ => undefined)
  const getJsonFileContentsFromGithubApi = async path => JSON.parse(await requestJson(githubDetails.contents_url.replace('{+path}', `${encode(path)}`) + `?ref=${encode(chosenBranch)}`).then(result => Buffer.from(result.content, 'base64').toString()))
  const packageJsonContents = await getJsonFileContentsFromGithubApi('/package.json').catch(e => undefined)
  const pluginConfig = await getJsonFileContentsFromGithubApi('/govuk-prototype-kit.config.json').catch(e => undefined)
  if (!packageJsonContents) {
    return doesntExistResponse
  }
  const npmIdentifier = `github:${org}/${project}` + (branch ? `#${chosenBranch}` : '')
  const packageName = packageJsonContents.name
  const version = packageJsonContents.version
  const refParts = ['github', org, project]
  if (branch) {
    refParts.push(branch)
  }
  return await addStandardDetails({
    exists: true,
    packageName,
    version,
    releaseDateTime: await updatedTimePromise,
    legacyInstallQueryString: `?package=${encode(packageName)}&version=${encode(npmIdentifier)}`,
    npmIdentifier,
    pluginConfig,
    origin: 'Github',
    internalRef: refParts.join(':')
  })
}

async function getPluginDetailsFromFileSystem (pluginPath) {
  const packageJsonText = await fsp.readFile(path.join(pluginPath, 'package.json'), 'utf8').catch(e => undefined)
  const pluginConfigText = await fsp.readFile(path.join(pluginPath, 'govuk-prototype-kit.config.json'), 'utf8').catch(e => undefined)

  if (!packageJsonText) {
    return doesntExistResponse
  }

  const packageJson = JSON.parse(packageJsonText)
  const pluginConfig = pluginConfigText && JSON.parse(pluginConfigText)

  const internalRef = pluginPath.startsWith(nodeModulesDir) ? `installed:${path.relative(nodeModulesDir, pluginPath)}` : `fs:${pluginPath}`
  return await addStandardDetails({
    exists: true,
    packageName: packageJson.name,
    version: packageJson.version,
    queryString: `?package=${encode(packageJson.name)}&version=${encode(pluginPath)}`,
    npmIdentifier: `file:${pluginPath}`,
    origin: 'File System',
    internalRef,
    pluginConfig
  })
}

async function addStandardDetails (config) {
  const updatedConfig = { ...config, ...preparePackageNameForDisplay(config.packageName) }

  updatedConfig.links = {
    pluginDetails: ['', contextPath, 'plugin', updatedConfig.internalRef].map(encodeRef).join('/')
  }
  updatedConfig.links.install = [updatedConfig.links.pluginDetails, 'install'].join('/')
  updatedConfig.links.uninstall = [updatedConfig.links.pluginDetails, 'uninstall'].join('/')
  updatedConfig.links.update = [updatedConfig.links.pluginDetails, 'update'].join('/')

  updatedConfig.commands = updatedConfig.commands || {}
  updatedConfig.commands.uninstall = updatedConfig.commands.uninstall || `npm uninstall ${updatedConfig.packageName}`
  updatedConfig.commands.update = updatedConfig.commands.update || `npm install ${updatedConfig.packageName}@latest --save-exact`
  updatedConfig.commands.install = updatedConfig.commands.install || `npm install ${updatedConfig.npmIdentifier} --save-exact`

  const proxyConfig = pluginProxyConfig[config.packageName] || {}

  Object.keys(proxyConfig).forEach(key => {
    if (!updatedConfig?.pluginConfig || !updatedConfig?.pluginConfig[key]) {
      updatedConfig.pluginConfig = updatedConfig.pluginConfig || {}
      updatedConfig.pluginConfig[key] = proxyConfig[key]
    }
  })

  return updatedConfig
}

async function getInstalledPluginDetails (packageName) {
  let foundPlugin
  const packageJson = await fse.readJson(packageJsonFilePath)
  const npmId = packageJson.dependencies[packageName]

  if (!npmId) {
    return doesntExistResponse
  }

  const [prefix, id] = npmId.split(':')

  if (prefix === 'github') {
    const [ghid, branch] = id.split('#')
    const [org, project] = ghid.split('/')
    foundPlugin = await getPluginDetailsFromGithub(org, project, branch)
  } else if (prefix === 'file') {
    foundPlugin = await getPluginDetailsFromFileSystem(path.resolve(projectDir, id))
  } else {
    foundPlugin = await getPluginDetailsFromFileSystem(path.join(nodeModulesDir, packageName))
  }

  if (foundPlugin) {
    const oldInternalRef = foundPlugin.internalRef
    foundPlugin.internalRef = `installed:${packageName}`
    foundPlugin.links.pluginDetails = foundPlugin.links.pluginDetails.replaceAll(oldInternalRef, foundPlugin.internalRef)
    return foundPlugin
  } else {
    return doesntExistResponse
  }
}

async function getPluginDetailsFromRef (ref) {
  const [source, id, ...extra] = (ref || '').split(':')

  if (source === 'installed') {
    return await self.getInstalledPluginDetails(id)
  }
  if (source === 'fs') {
    return await self.getPluginDetailsFromFileSystem(id)
  }
  if (source === 'github') {
    if (extra[1]) {
      return await self.getPluginDetailsFromGithub(id, extra[0], extra[1])
    } else {
      return await self.getPluginDetailsFromGithub(id, extra[0])
    }
  }
  if (source === 'npm') {
    if (extra[0]) {
      return await self.getPluginDetailsFromNpm(id, extra[0])
    } else {
      return await self.getLatestPluginDetailsFromNpm(id)
    }
  }
}

async function getInstalledPackages () {
  const packageJson = await fse.readJson(packageJsonFilePath)

  return await Promise.all(Object.keys(packageJson.dependencies).map(async packageName => getInstalledPluginDetails(packageName)))
}

async function getKnownPlugins () {
  return await Promise.all(availablePlugins.map(async packageName => getLatestPluginDetailsFromNpm(packageName)))
}

async function isInstalled (ref) {
  const plugin = await getPluginDetailsFromRef(ref)
  return await fse.readJson(packageJsonFilePath).then(x => Object.keys(x.dependencies).includes(plugin.packageName))
}

const self = {
  getInstalledPackages,
  getKnownPlugins,
  getPluginDetailsFromFileSystem,
  getInstalledPluginDetails,
  getPluginDetailsFromRef,
  isInstalled
}

self.getPluginDetailsFromGithub = cacheFunctionCalls(getPluginDetailsFromGithub, { maxTimeMinutes: 20 })
self.getPluginDetailsFromNpm = cacheFunctionCalls(getPluginDetailsFromNpm, { maxTimeMinutes: 120 })
self.getLatestPluginDetailsFromNpm = cacheFunctionCalls(getLatestPluginDetailsFromNpm, { maxTimeMinutes: 20 })
self.getInstalledPackages = getInstalledPackages
self.getKnownPlugins = getKnownPlugins

module.exports = self
