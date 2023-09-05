// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')
const querystring = require('querystring')
const { doubleCsrf } = require('csrf-csrf')

// local dependencies
const config = require('./config')
const plugins = require('./plugins/plugins')
const { exec } = require('./exec')
const { prototypeAppScripts } = require('./utils')
const { projectDir, packageDir, appViewsDir, commandsDir } = require('./utils/paths')
const nunjucksConfiguration = require('./nunjucks/nunjucksConfiguration')
const syncChanges = require('./sync-changes')
const { plugins: knownPlugins } = require('../known-plugins.json')

const contextPath = '/manage-prototype'

const appViews = plugins.getAppViews([
  path.join(projectDir, 'node_modules'),
  path.join(projectDir, 'app/views/'),
  path.join(packageDir, 'lib/final-backup-nunjucks')
])

let kitRestarted = false

const {
  name: currentKitName,
  version: currentKitVersion
} = require(path.join(packageDir, 'package.json'))
const {
  getPluginDetailsFromFileSystem, getPluginDetailsFromGithub, getPluginDetailsFromNpm,
  getLatestPluginDetailsFromNpm, getPluginDetailsFromRef, getInstalledPackages, getKnownPlugins,
  getInstalledPluginDetails, isInstalled
} = require('./utils/packageDetails')
const { getConfig } = require('./config')

async function isValidVersion (packageName, version) {
  const { versions = [], localVersion } = await lookupPackageInfo(packageName, version)
  const validVersions = [...versions, localVersion].filter(version => version)
  const isVersionValid = validVersions.includes(version)
  if (!isVersionValid) {
    console.log('version', version, ' is not valid, valid opt ions are:\n\n', validVersions)
  }
  return isVersionValid
}

function getManagementView (filename) {
  return ['views', 'manage-prototype', filename].join('/')
}

// Local dependencies
const encryptPassword = require('./utils').encryptPassword

const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: (req) => 'Secret',
  cookieName: 'x-csrf-token'
})

// Error handling, validation error interception
const csrfErrorHandler = (error, req, res, next) => {
  if (error === invalidCsrfTokenError) {
    res.status(403).json({
      error: 'invalid csrf token'
    })
  } else {
    next()
  }
}

function getPageLoadedHandler (req, res) {
  const result = syncChanges.pageLoaded()
  return res.json(result)
}

function getCsrfTokenHandler (req, res) {
  const token = generateToken(res, req)
  return res.json({ token })
}

// Clear all data in session
function getClearDataHandler (req, res) {
  res.render(getManagementView('clear-data.njk'))
}

function postClearDataHandler (req, res) {
  req.session.data = {}
  res.render(getManagementView('clear-data-success.njk'))
}

// Render password page with a returnURL to redirect people to where they came from
function getPasswordHandler (req, res) {
  const returnURL = req.query.returnURL || '/'
  const error = req.query.error
  res.render(getManagementView('password.njk'), { returnURL, error })
}

// Check authentication password
function postPasswordHandler (req, res) {
  const password = config.getConfig().password
  const submittedPassword = req.body.password
  const providedUrl = req.body.returnURL
  const processedRedirectUrl = (!providedUrl || providedUrl.startsWith('/manage-prototype/password')) ? '/' : providedUrl

  if (submittedPassword === password) {
    // see lib/middleware/authentication.js for explanation
    res.cookie('authentication', encryptPassword(password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: 'None', // Allows GET and POST requests from other domains
      httpOnly: true,
      secure: true
    })
    res.redirect(processedRedirectUrl)
  } else {
    res.redirect('/manage-prototype/password?error=wrong-password&returnURL=' + encodeURIComponent(processedRedirectUrl))
  }
}

// Middleware to ensure the routes specified below will render the manage-prototype-not-available
// view when the prototype is not running in development
function developmentOnlyMiddleware (req, res, next) {
  if (config.getConfig().isDevelopment || req.url.startsWith('/dependencies/govuk-frontend')) {
    next()
  } else {
    res.render(getManagementView('manage-prototype-not-available.njk'))
  }
}

const managementLinks = [
  {
    text: 'Home',
    url: contextPath
  },
  {
    text: 'Templates',
    url: '/manage-prototype/templates'
  },
  {
    text: 'Plugins',
    url: '/manage-prototype/plugins'
  },
  {
    text: 'Go to prototype',
    url: '/'
  }
]

async function readFileIfExists (path) {
  if (await fse.exists(path)) {
    return await fse.readFile(path, 'utf8')
  }
}

async function getHomeHandler (req, res) {
  const pageName = 'Home'
  const { serviceName } = config.getConfig()

  const originalHomepage = await fse.readFile(path.join(packageDir, 'prototype-starter', 'app', 'views', 'index.html'), 'utf8')
  const currentHomepage = await readFileIfExists(path.join(appViewsDir, 'index.html'))

  const kitPackage = await getLatestPluginDetailsFromNpm('govuk-prototype-kit')

  const viewData = {
    currentUrl: req.originalUrl,
    currentSection: pageName,
    links: managementLinks,
    kitUpdateAvailable: kitPackage.version !== currentKitVersion,
    latestAvailableKit: kitPackage.version,
    latestKitUrl: kitPackage.links.pluginDetails,
    tasks: [
      {
        done: serviceName !== 'Service name goes here' && serviceName !== 'GOV.UK Prototype Kit',
        html: 'Change the service name in the file <strong>app/config.json</strong>'
      }, {
        done: currentHomepage !== undefined && originalHomepage !== currentHomepage,
        html: 'Edit the homepage in the file <strong>app/views/index.html</strong>'
      }
    ]
  }

  res.render(getManagementView('index.njk'), viewData)
}

function exampleTemplateConfig (packageName, { name, path }) {
  const queryString = `?package=${encodeURIComponent(packageName)}&template=${encodeURIComponent(path)}`
  return {
    name,
    path: require('path').join(packageName, path),
    installLink: `/manage-prototype/templates/install${queryString}`,
    viewLink: `/manage-prototype/templates/view${queryString}`
  }
}

function getPluginTemplates () {
  const templates = plugins.getByType('templates')
  const output = []
  templates.forEach(({ packageName, item }) => {
    const matchingPackages = output.filter(x => x.packageName === packageName)
    if (item.type !== 'nunjucks') {
      console.warn(`Omitting ${item.name} from ${packageName} because the type ${JSON.stringify(item.type)} isn't supported.  The only currently supported type is "nunjucks".`)
      return
    }
    let packageDescription
    if (matchingPackages.length > 0) {
      packageDescription = matchingPackages[0]
    } else {
      packageDescription = {
        packageName,
        pluginDisplayName: plugins.preparePackageNameForDisplay(packageName),
        templates: []
      }
      output.push(packageDescription)
    }
    packageDescription.templates.push(exampleTemplateConfig(packageName, item))
  })
  return output
}

async function getTemplatesHandler (req, res) {
  const pageName = 'Templates'
  const availableTemplates = getPluginTemplates()

  const commonTemplatesPackageName = '@govuk-prototype-kit/common-templates'
  const govUkFrontendPackageName = 'govuk-frontend'
  let commonTemplatesDetails
  const installedPlugins = (await getInstalledPackages()).map((pkg) => pkg.packageName)
  console.log('installed', installedPlugins)
  if (installedPlugins.includes(govUkFrontendPackageName) && !installedPlugins.includes(commonTemplatesPackageName)) {
    commonTemplatesDetails = {
      pluginDisplayName: plugins.preparePackageNameForDisplay(commonTemplatesPackageName),
      installLink: `${contextPath}/plugins/install?package=${encodeURIComponent(commonTemplatesPackageName)}&returnTo=templates`
    }
  }

  res.render(getManagementView('templates.njk'), {
    currentSection: pageName,
    links: managementLinks,
    availableTemplates,
    commonTemplatesDetails
  })
}

function locateTemplateConfig (req) {
  const debugOutput = []
  const packageTemplates = getPluginTemplates().filter(({ packageName }) => packageName === req.query.package)
  debugOutput.push(`packages ${JSON.stringify(packageTemplates.map(({ packageName }) => packageName), null, 2)}`)
  if (packageTemplates.length > 0) {
    const pathToMatch = [packageTemplates[0].packageName, req.query.template].join('')
    debugOutput.push(`path to match ${pathToMatch}`)
    const templates = packageTemplates[0].templates.filter(({ path }) => {
      // switch backslashes for forward slashes in case of windows
      path = path.split('\\').join('/')
      debugOutput.push(`path ${path}`)
      return path === pathToMatch
    })
    if (templates.length > 0) {
      debugOutput.push('found')
      return templates[0]
    } else {
      debugOutput.push('not found')
    }
  }
}

function getTemplatesViewHandler (req, res) {
  const model = {
    pluginConfig: plugins.getAppConfig({ scripts: prototypeAppScripts }),
    serviceName: 'Service name goes here'
  }
  const templateConfig = locateTemplateConfig(req)

  const nunjucksAppEnv = nunjucksConfiguration.getNunjucksAppEnv(appViews)

  if (templateConfig) {
    res.send(nunjucksAppEnv.render(templateConfig.path, model))
  } else {
    res.status(404).send('Template not found.')
  }
}

function getTemplatesInstallHandler (req, res) {
  const templateConfig = locateTemplateConfig(req)

  if (templateConfig) {
    res.render(getManagementView('template-install.njk'), {
      currentSection: 'Templates',
      pageName: `Create new ${templateConfig.name}`,
      currentUrl: req.originalUrl,
      links: managementLinks,
      templateName: templateConfig.name,
      error: ({
        exists: 'Path already exists',
        missing: 'Enter a path',
        singleSlash: 'Path must not be a single forward slash (/)',
        endsWithSlash: 'Path must not end in a forward slash (/)',
        multipleSlashes: 'must not include a slash followed by another slash (//)',
        invalid: 'Path must not include !$&\'()*+,;=:?#[]@.% or space'
      })[req.query.errorType],
      chosenUrl: req.query['chosen-url']
    })
  } else {
    res.status(404).send('Template not found.')
  }
}

function getFileExtensionForNunjucksFiles () {
  return config.getConfig().useNjkExtensions ? 'njk' : 'html'
}

async function postTemplatesInstallHandler (req, res) {
  const templateConfig = locateTemplateConfig(req)
  const templatePath = path.join(projectDir, 'node_modules', templateConfig.path)

  let chosenUrl = req.body['chosen-url'].trim().normalize()

  const installLocation = path.join(appViewsDir, `${chosenUrl}.${(getFileExtensionForNunjucksFiles())}`)

  const renderError = (errorType) => {
    const query = querystring.stringify({
      ...req.query,
      'chosen-url': req.body['chosen-url'],
      errorType
    })
    const url = `${req.originalUrl.split('?')[0]}?${query}`
    res.redirect(url)
  }

  if (!chosenUrl.length) {
    renderError('missing')
    return
  }

  if (chosenUrl === '/') {
    renderError('singleSlash')
    return
  }

  if (chosenUrl[chosenUrl.length - 1] === '/') {
    renderError('endsWithSlash')
    return
  }

  if (chosenUrl.indexOf('//') !== -1) {
    renderError('multipleSlashes')
    return
  }

  // Don't allow URI reserved characters (per RFC 3986) in paths
  if ('!$&\'()*+,;=:?#[]@.% '.split('').some((char) => chosenUrl.includes(char))) {
    renderError('invalid')
    return
  }

  if (await fse.exists(installLocation)) {
    renderError('exists')
    return
  }

  await fse.ensureDir(path.dirname(installLocation))
  await fse.copy(templatePath, installLocation)

  // Inject a forward slash if the user hasn't included one
  if (chosenUrl[0] !== '/') {
    chosenUrl = '/' + chosenUrl
  }

  res.redirect(`/manage-prototype/templates/post-install?chosen-url=${encodeURIComponent(chosenUrl)}`)
}

function getTemplatesPostInstallHandler (req, res) {
  const pageName = 'Page created'
  const chosenUrl = req.query['chosen-url']

  res.render(getManagementView('template-post-install.njk'), {
    currentSection: 'Templates',
    pageName,
    links: managementLinks,
    url: chosenUrl,
    filePath: path.join('app', 'views', `${chosenUrl}.${getFileExtensionForNunjucksFiles()}`)
  })
}

async function buildPluginData (plugin) {
  const latestVersion = (await getLatestPluginDetailsFromNpm(plugin.packageName))?.version
  const installedPlugin = await getInstalledPluginDetails(plugin.packageName)
  const installedVersion = installedPlugin?.version

  return {
    ...plugin,
    installedVersion: installedVersion,
    isInstalled: !!installedVersion,
    updateAvailable: latestVersion && installedVersion && installedVersion !== latestVersion,
    description: plugin.pluginConfig?.meta?.description,
    pluginDetailsLink: installedPlugin?.links?.pluginDetails || plugin.links.pluginDetails
  }
}

function getTimeSummary (date) {
  const epochDate = date.getTime()
  const epochNow = new Date().getTime()
  const timeDifferenceInDays = (epochNow - epochDate) / 1000 / 60 / 60 / 24
  if (timeDifferenceInDays < 1) {
    return 'today'
  }
  if (timeDifferenceInDays < 2) {
    return 'yesterday'
  }
  if (timeDifferenceInDays < 14) {
    return Math.floor(timeDifferenceInDays) + ' days ago'
  }
  return Math.floor(timeDifferenceInDays / 7) + ' weeks ago'
}

async function prepareForPluginPage (isInstalledPage, search) {
  const allPlugins = await getKnownPlugins()
  const installedPlugins = await getInstalledPackages()

  const plugins = isInstalledPage
    ? installedPlugins
    : allPlugins.filter(plugin => {
      const pluginName = plugin.packageName?.toLowerCase()
      return pluginName.indexOf(search.toLowerCase()) >= 0
    })

  return {
    status: isInstalledPage ? 'installed' : 'search',
    plugins: await Promise.all(plugins.map(buildPluginData)),
    found: plugins.length,
    updates: installedPlugins.filter(plugin => plugin.updateAvailable).length
  }
}

const verbs = {
  update: {
    title: 'Update',
    para: 'update',
    status: 'updated',
    progressive: 'updating',
    dependencyPara: 'install'
  },
  install: {
    title: 'Install',
    para: 'install',
    status: 'installed',
    progressive: 'installing',
    dependencyPara: 'install'
  },
  uninstall: {
    title: 'Uninstall',
    para: 'uninstall',
    status: 'uninstalled',
    progressive: 'uninstalling',
    dependencyPara: 'uninstall'
  }
}

async function getPluginsHandler (req, res) {
  const isInstalledPage = req.route.path.endsWith('installed')
  const {
    search = '',
    error,
    fsPath,
    githubOrg,
    githubProject,
    githubBranch,
    npmPackage,
    npmVersion,
    source
  } = req.query || {}
  const pageName = 'Plugins'
  const { plugins, status, updates = 0, found = 0 } = await prepareForPluginPage(isInstalledPage, search)
  const foundMessage = found === 1 ? found + ' Plugin found' : found + ' Plugins found'
  const updatesMessage = updates ? updates === 1 ? updates + ' UPDATE AVAILABLE' : updates + ' UPDATES AVAILABLE' : ''
  const model = {
    currentSection: pageName,
    links: managementLinks,
    isInstalledPage,
    showPluginLookup: getConfig().showPluginLookup,
    isSearchPage: !isInstalledPage,
    search,
    plugins,
    updatesMessage,
    foundMessage,
    status,
    playback: {
      error,
      fsPath,
      githubOrg,
      githubProject,
      githubBranch,
      npmPackage,
      npmVersion,
      source
    }
  }

  res.render(getManagementView('plugins.njk'), model)
}

async function postPluginsHandler (req, res) {
  const query = req.body?.search?.trim() ? `?search=${req.body.search}` : ''
  res.redirect(contextPath + req.route.path + query)
}

async function postPluginDetailsHandler (req, res) {
  let found
  const {
    fsPath,
    githubOrg,
    githubProject,
    githubBranch,
    npmPackage,
    npmVersion,
    source,
    notFoundErrorUrl
  } = req.body

  if (source === 'fs') {
    found = await getPluginDetailsFromFileSystem(fsPath)
  } else if (source === 'github') {
    found = await getPluginDetailsFromGithub(githubOrg, githubProject, githubBranch)
  } else if (source === 'npm' && npmVersion) {
    found = await getPluginDetailsFromNpm(npmPackage, npmVersion)
  } else if (source === 'npm') {
    found = await getLatestPluginDetailsFromNpm(npmPackage)
  }

  if (found && found.exists && found.pluginConfig) {
    res.redirect(found.links.pluginDetails)
  } else {
    const [url, query] = notFoundErrorUrl.split('?')
    const queryParts = [query].concat([
      'fsPath',
      'githubOrg',
      'githubProject',
      'githubBranch',
      'npmPackage',
      'npmVersion',
      'source'
    ].map(x => {
      return x && `${encodeURIComponent(x)}=${encodeURIComponent(req.body[x])}`
    })).filter(x => x)
    res.redirect([url, queryParts.join('&')].join('?'))
  }
}

async function getPluginDetailsHandler (req, res, next) {
  const config = getConfig()
  const pluginDetails = await getPluginDetailsFromRef(req.params.packageRef).catch(e => undefined)

  if (!pluginDetails?.pluginConfig) {
    console.warn('No page found for plugin ref', req.params.packageRef)
    const err = new Error('Page not found')
    err.status = 404
    next(err)
    return
  }

  if (req.originalUrl !== pluginDetails.links.pluginDetails) {
    const redirectUrl = pluginDetails.links.pluginDetails
    console.log('redirecting from:', req.originalUrl)
    console.log('redirecting to:', redirectUrl)
    res.redirect(redirectUrl)
    return
  }

  const latestVersionPromise = getLatestPluginDetailsFromNpm(pluginDetails.packageName)
  const installedVersionPromise = getPluginDetailsFromRef('installed:' + pluginDetails.packageName)

  function replaceUrlVars (url) {
    return url && url
      .replace('{{version}}', pluginDetails.version || pluginDetails.latestVersion)
      .replace('{{kitVersion}}', currentKitVersion)
  }

  function getInThisPluginDetails () {
    const list = []
    if (pluginDetails.pluginConfig.nunjucksMacros && pluginDetails.pluginConfig.nunjucksMacros.length > 0) {
      list.push({
        title: 'Components',
        items: pluginDetails.pluginConfig.nunjucksMacros.map(x => x.macroName)
      })
    }
    if (pluginDetails.pluginConfig.templates && pluginDetails.pluginConfig.templates.length > 0) {
      list.push({
        title: 'Templates',
        items: pluginDetails.pluginConfig.templates.map(x => x.name)
      })
    }
    return list
  }

  const model = {
    currentSection: 'Plugins',
    links: managementLinks,
    pluginDetails,
    pluginDescription: pluginDetails?.pluginConfig?.meta?.description,
    version: pluginDetails.version,
    releaseTimeSummary: pluginDetails.releaseDateTime && getTimeSummary(new Date(pluginDetails.releaseDateTime)),
    inThisPlugin: getInThisPluginDetails(),
    preparedPluginLinks: {
      documentation: replaceUrlVars(pluginDetails?.pluginConfig?.meta?.urls?.documentation),
      versionHistory: replaceUrlVars(pluginDetails?.pluginConfig?.meta?.urls?.versionHistory),
      releaseNotes: replaceUrlVars(pluginDetails?.pluginConfig?.meta?.urls?.releaseNotes)
    }
  }

  const latestVersion = await latestVersionPromise
  const installedVersion = await installedVersionPromise

  if (latestVersion.version !== pluginDetails.version) {
    model.newerLink = latestVersion.links.pluginDetails
    model.newerVersion = latestVersion.version
  }
  if (installedVersion?.version && latestVersion.version !== installedVersion?.version) {
    model.updateLink = pluginDetails.links.update
  }
  if (await isInstalled(pluginDetails.internalRef)) {
    if (!knownPlugins.required.includes(pluginDetails.packageName) || (config.allowGovukFrontendUninstall && pluginDetails.packageName === 'govuk-frontend')) {
      model.uninstallLink = pluginDetails.links.uninstall
    }
  } else {
    model.installLink = pluginDetails.links.install
  }
  if (config.showPluginDowngradeButtons && model.newerLink) {
    model.installLink = pluginDetails.links.install
    model.installLinkText = 'Install this version'
  }

  if (config.showPluginDebugInfo) {
    model.debugInfo = [
      '',
      'versions:',
      '',
      `viewing: ${pluginDetails?.version}`,
      `latest: ${latestVersion?.version}`,
      `installed: ${installedVersion?.version}`,
      '',
      'origin:',
      '',
      `viewing: ${pluginDetails?.origin}`,
      `latest: ${latestVersion?.origin}`,
      `installed: ${installedVersion?.origin}`,
    ].join('\n')
  }

  res.render(getManagementView('pluginDetails.njk'), model)
}

function modeIsComplete (mode, { installedVersion, latestVersion, version, installedLocally }) {
  switch (mode) {
    case 'update':
      return installedVersion === latestVersion
    case 'install':
      return installedLocally || (version ? installedVersion === version : !!installedVersion)
    case 'uninstall':
      return !installedVersion
  }
}

async function getPluginsModeHandler (req, res) {
  const isSameOrigin = req.headers['sec-fetch-site'] === 'same-origin'
  const { packageRef, mode } = req.params
  const verb = verbs[mode]

  if (!verb) {
    res.status(404).send(`Page not found: ${req.path}`)
    return
  }

  const chosenPlugin = await getPluginDetailsFromRef(packageRef)

  const command = chosenPlugin.commands[mode]

  if (!command) {
    console.log('command not found for mode', mode, Object.keys(chosenPlugin.commands))
    res.status(404).send(`Page not found: ${req.path}`)
    return
  }

  const pageName = `${verb.title} ${chosenPlugin.name}`

  const templatesReturnLink = {
    href: '/manage-prototype/templates',
    text: 'Back to templates'
  }
  const pluginsReturnLink = {
    href: chosenPlugin.links.pluginDetails,
    text: 'Back to plugin details'
  }

  const returnLink = req.query.returnTo === 'templates' ? templatesReturnLink : pluginsReturnLink

  const fullPluginName = `${chosenPlugin.name}${chosenPlugin.version ? ` version ${chosenPlugin.version} ` : ''}${chosenPlugin.scope ? ` from ${chosenPlugin.scope}` : ''}`

  let pluginHeading = `${verb.title} ${fullPluginName}`

  let dependencyHeading = ''

  if (chosenPlugin?.fileSystemLocation) {
    pluginHeading += ` from ${chosenPlugin.fileSystemLocation}`
  }

  if (chosenPlugin?.dependentPlugins?.length) {
    dependencyHeading = `Other plugins need ${fullPluginName}`
  } else if (chosenPlugin?.dependencyPlugins?.length) {
    dependencyHeading = `${fullPluginName} needs other plugins`
  }

  res.render(getManagementView('plugin-install-or-uninstall.njk'), {
    currentSection: 'Plugins',
    pageName,
    currentUrl: req.originalUrl,
    links: managementLinks,
    chosenPlugin,
    command,
    pluginHeading,
    dependencyHeading,
    verb,
    isSameOrigin,
    returnLink
  })
}

function setKitRestarted (state) {
  kitRestarted = state
}

function getModeFromRequest (req) {
  const { mode } = req.params
  if (mode === 'upgrade') {
    return 'update'
  }
  return mode
}

async function postPluginsModeMiddleware (req, res, next) {
  // Redirect to the GET route of the same url when the post request is not an ajax request
  if (req.headers['content-type'].indexOf('json') === -1) {
    res.redirect(req.originalUrl)
  } else {
    next()
  }
}

async function queueCommand (command) {
  await fse.ensureDir(commandsDir)

  const commandId = new Date().toISOString()
  const filePath = path.join(commandsDir, commandId + '.json')

  await fse.writeJson(filePath, { command, restartOnCompletion: true, status: 'pending' })
  return commandId
}

async function runPluginMode (req, res) {
  const { mode, packageRef } = req.params
  const plugin = await getPluginDetailsFromRef(packageRef)

  const command = plugin.commands && plugin.commands[mode]

  const commandId = await queueCommand(command)

  res.send({
    mode,
    commandId,
    statusUrl: `${contextPath}/command/${commandId}/status`
  })
}

async function postPluginsModeHandler (req, res) {
  const mode = getModeFromRequest(req)

  // Allow smooth update from 13.1.0 as the status route is incorrectly matched
  if (mode === 'status') {
    req.params.mode = 'update'
    return postPluginsStatusHandler(req, res)
  }

  // Reset to false so the status route will only return completed when the prototype has restarted
  setKitRestarted(false)

  const verb = verbs[mode]

  if (!verb) {
    res.json({ status: 'error' })
    return
  }

  // Prevent uninstalling the kit itself
  if (req.body.package === currentKitName && mode === 'uninstall') {
    res.json({ status: 'error' })
    return
  }

  let status = 'processing'
  try {
    const chosenPlugin = await getPluginForRequest(req)
    if (!chosenPlugin) {
      status = 'error'
    } else if (modeIsComplete(mode, chosenPlugin)) {
      status = 'completed'
    } else {
      const command = getCommand(mode, chosenPlugin)
      await exec(command, { cwd: projectDir })
        .finally(() => {
          console.log(`Completed ${command}`)
          // force the application to stop after a delay as nodemon restart does not always work on Windows when running acceptance tests
          setTimeout(() => {
            process.exit(1)
          }, 6000)
        })
    }
  } catch (e) {
    console.log(e)
    status = 'error'
  }
  res.json({ status })
}

async function getCommandStatus (req, res) {
  const { commandId } = req.params
  try {
    const status = await fse.readJson(path.join(commandsDir, commandId + '.json'))
    res.send(status)
  } catch (e) {
    console.error(e)
    res.status(400).send(e)
  }
}

module.exports = {
  contextPath,
  setKitRestarted,
  csrfProtection: [doubleCsrfProtection, csrfErrorHandler],
  getPageLoadedHandler,
  getCsrfTokenHandler,
  getClearDataHandler,
  postClearDataHandler,
  getPasswordHandler,
  postPasswordHandler,
  developmentOnlyMiddleware,
  getHomeHandler,
  getTemplatesHandler,
  getTemplatesViewHandler,
  getTemplatesInstallHandler,
  postTemplatesInstallHandler,
  getTemplatesPostInstallHandler,
  getPluginsHandler,
  postPluginsHandler,
  getPluginDetailsHandler,
  postPluginDetailsHandler,
  getPluginsModeHandler,
  postPluginsModeMiddleware,
  postPluginsModeHandler,
  getCommandStatus,
  runPluginMode
}
