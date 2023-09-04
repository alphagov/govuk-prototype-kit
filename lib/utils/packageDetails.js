const fsp = require('fs').promises
const path = require('path')
const fse = require('fs-extra')
const requestHttps = require('./requestHttps')
const { preparePackageNameForDisplay } = require('../plugins/plugins')
const { projectDir } = require('./paths')
const encode = encodeURIComponent

const nodeModulesDir = path.join(projectDir, 'node_modules')
const packageJsonFilePath = path.join(projectDir, 'package.json')
const contextPath = 'manage-prototype'
const doesntExistResponse = {
  exists: false
}

async function getPluginDetailsFromNpm (packageName, version) {
  if (!version) {
    throw new Error('No version specified, version must be specified')
  }
  let registerEntry
  try {
    registerEntry = await requestHttps.requestHttpsJson(`https://registry.npmjs.org/${encode(packageName)}`)
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
      pluginConfig: await requestHttps.getPluginConfigContentsFromNodeModule(versionConfig.dist.tarball)
    })
  } else {
    return doesntExistResponse
  }
}

async function getLatestPluginDetailsFromNpm (packageName) {
  let result
  try {
    const registerEntry = await requestHttps.requestHttpsJson(`https://registry.npmjs.org/${encode(packageName)}`)
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
    githubDetails = await requestHttps.requestHttpsJson(`https://api.github.com/repos/${encode(org)}/${encode(project)}`)
  } catch (e) {
    if (e.statusCode === 404) {
      return doesntExistResponse
    }
    console.log('Unexpected error when looking up in Github', e)
    throw e
  }
  const chosenBranch = branch || githubDetails.default_branch
  const updatedTimePromise = requestHttps.requestHttpsJson(githubDetails.branches_url.replace('{/branch}', '/' + chosenBranch))
    .then(x => x.commit.commit.author.date)
    .catch(err => undefined)
  const getJsonFileContentsFromGithubApi = async path => JSON.parse(await requestHttps.requestHttpsJson(githubDetails.contents_url.replace('{+path}', `${encode(path)}`) + `?ref=${encode(chosenBranch)}`).then(result => Buffer.from(result.content, 'base64').toString()))
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
    internalRef,
    pluginConfig
  })
}

async function addStandardDetails (config) {
  const updatedConfig = { ...config, ...preparePackageNameForDisplay(config.packageName) }
  updatedConfig.links = {
    pluginDetails: ['', contextPath, 'plugin', updatedConfig.internalRef].map(encode).join('/')
  }
  updatedConfig.links.install = [updatedConfig.links.pluginDetails, 'install'].join('/')
  updatedConfig.links.uninstall = [updatedConfig.links.pluginDetails, 'uninstall'].join('/')
  updatedConfig.links.update = [updatedConfig.links.pluginDetails, 'update'].join('/')

  if (updatedConfig.isInstalled === undefined) {
    updatedConfig.isInstalled = await fse.readJson(packageJsonFilePath).then(x => Object.keys(x.dependencies).includes(config.packageName))
  }

  return updatedConfig
}

async function getPluginDetailsFromRef (ref) {
  const [source, id, ...extra] = (ref || '').split(':')

  if (source === 'installed') {
    return await getPluginDetailsFromFileSystem(path.join(nodeModulesDir, id))
  }
  if (source === 'fs') {
    return await getPluginDetailsFromFileSystem(id)
  }
  if (source === 'github') {
    if (extra[1]) {
      return await getPluginDetailsFromGithub(id, extra[0], extra[1])
    } else {
      return await getPluginDetailsFromGithub(id, extra[0])
    }
  }
  if (source === 'npm') {
    if (extra[0]) {
      return await getPluginDetailsFromNpm(id, extra[0])
    } else {
      return await getLatestPluginDetailsFromNpm(id)
    }
  }
}

const self = module.exports = {
  getPluginDetailsFromNpm,
  getLatestPluginDetailsFromNpm,
  getPluginDetailsFromGithub,
  getPluginDetailsFromFileSystem,
  getPluginDetailsFromRef
}
