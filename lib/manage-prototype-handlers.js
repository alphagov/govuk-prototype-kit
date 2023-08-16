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
const { projectDir, packageDir, appViewsDir } = require('./utils/paths')
const nunjucksConfiguration = require('./nunjucks/nunjucksConfiguration')
const syncChanges = require('./sync-changes')
const {
  lookupPackageInfo,
  getInstalledPackages,
  getAvailablePackages,
  getDependentPackages,
  getDependencyPackages,
  waitForPackagesCache
} = require('./plugins/packages')

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

async function isValidVersion (packageName, version) {
  const { versions = [], localVersion } = await lookupPackageInfo(packageName, version)
  const validVersions = [...versions, localVersion].filter(version => version)
  const isVersionValid = validVersions.includes(version)
  if (!isVersionValid) {
    console.log('version', version, ' is not valid, valid options are:\n\n', validVersions)
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
  const { passwords = [] } = config.getConfig() || {}
  const submittedPassword = req.body.password
  const providedUrl = req.body.returnURL
  const processedRedirectUrl = (!providedUrl || providedUrl.startsWith('/manage-prototype/password')) ? '/' : providedUrl

  if (passwords.some(password => submittedPassword === password)) {
    // see lib/middleware/authentication.js for explanation
    res.cookie('authentication', encryptPassword(submittedPassword), {
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
  if (config.getConfig().isDevelopment) {
    next()
  } else {
    res.render(getManagementView('manage-prototype-not-available.njk'))
  }
}

// Middleware to ensure pages load when plugin cache has been initially loaded
async function pluginCacheMiddleware (req, res, next) {
  await waitForPackagesCache()
  next()
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

  const kitPackage = await lookupPackageInfo('govuk-prototype-kit')

  const viewData = {
    currentUrl: req.originalUrl,
    currentSection: pageName,
    links: managementLinks,
    kitUpdateAvailable: kitPackage.latestVersion !== currentKitVersion,
    latestAvailableKit: kitPackage.latestVersion,
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

function buildPluginData (pluginData) {
  if (pluginData === undefined) {
    return
  }
  const {
    packageName,
    installed,
    installedLocally,
    latestVersion,
    installedVersion,
    required,
    localVersion
  } = pluginData
  const preparedPackageNameForDisplay = plugins.preparePackageNameForDisplay(packageName)
  return {
    ...preparedPackageNameForDisplay,
    packageName,
    latestVersion,
    installedLocally,
    installLink: `${contextPath}/plugins/install?package=${encodeURIComponent(packageName)}`,
    installCommand: `npm install ${packageName}`,
    updateLink: installed && !installedLocally && latestVersion !== installedVersion ? `${contextPath}/plugins/update?package=${encodeURIComponent(packageName)}` : undefined,
    updateCommand: latestVersion && `npm install ${packageName}@${latestVersion}`,
    uninstallLink: installed && !required ? `${contextPath}/plugins/uninstall?package=${encodeURIComponent(packageName)}${installedLocally ? `&version=${encodeURIComponent(localVersion)}` : ''}` : undefined,
    uninstallCommand: `npm uninstall ${packageName}`,
    installedVersion
  }
}

async function prepareForPluginPage () {
  const installedOut = {}
  const availableOut = {}
  const output = [installedOut, availableOut]

  const installedPlugins = await getInstalledPackages()
  const availablePlugins = await getAvailablePackages()

  installedOut.name = 'Installed'
  installedOut.plugins = installedPlugins.map(buildPluginData)
  installedOut.status = 'installed'
  availableOut.name = 'Available'
  availableOut.plugins = availablePlugins.map(buildPluginData)
  availableOut.status = 'available'

  return output
}

function getCommand (mode, chosenPlugin) {
  let {
    updateCommand,
    installCommand,
    uninstallCommand,
    version,
    dependencyPlugins,
    dependentPlugins
  } = chosenPlugin
  const dependents = dependentPlugins?.map(({ packageName }) => packageName).join(' ')
  const dependencies = dependencyPlugins?.map(({
    packageName,
    latestVersion
  }) => packageName + '@' + latestVersion).join(' ')

  if (version && installCommand) {
    installCommand += `@${version}`
  }

  if (dependents) {
    uninstallCommand += ' ' + dependents
  }

  if (dependencies) {
    installCommand += ' ' + dependencies
    updateCommand += ' ' + dependencies
  }

  switch (mode) {
    case 'update':
      return updateCommand + ' --save-exact'
    case 'install':
      return installCommand + ' --save-exact'
    case 'uninstall':
      return uninstallCommand
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
  const pageName = 'Plugins'
  const model = {
    currentSection: pageName,
    links: managementLinks,
    mode: req.query.mode
  }

  const isSuccessResult = !!req.query.package

  if (isSuccessResult) {
    model.successBanner = {
      package: plugins.preparePackageNameForDisplay(req.query.package),
      mode: req.query.mode,
      verb: verbs[req.query.mode].status
    }
  }
  model.groupsOfPlugins = await prepareForPluginPage()
  res.render(getManagementView('plugins.njk'), model)
}

async function getPluginForRequest (req) {
  const packageName = req.query.package || req.body.package
  const version = req.query.version || req.body.version
  const mode = getModeFromRequest(req)
  let chosenPlugin

  if (packageName) {
    chosenPlugin = buildPluginData(await lookupPackageInfo(packageName, version))
    if (!chosenPlugin) {
      return // chosen plugin will be invalid
    }
    if (version) {
      if (await isValidVersion(packageName, version)) {
        chosenPlugin.version = version
      } else if (chosenPlugin.installedLocally) {
        chosenPlugin.version = chosenPlugin.installedVersion
      } else {
        return // chosen plugin will be invalid
      }
    }
  }

  const dependentPlugins = (await getDependentPackages(chosenPlugin.packageName, version, mode))
    .filter(({ installed }) => installed || mode !== 'uninstall')
    .map(buildPluginData)

  if (dependentPlugins.length) {
    chosenPlugin.dependentPlugins = dependentPlugins
  }

  const dependencyPlugins = (await getDependencyPackages(chosenPlugin.packageName, version, mode)).map(buildPluginData)

  if (dependencyPlugins.length) {
    chosenPlugin.dependencyPlugins = dependencyPlugins
  }

  return chosenPlugin
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
  const mode = getModeFromRequest(req)
  const { version } = req.query
  const verb = verbs[mode]

  if (!verb) {
    res.status(404).send(`Page not found: ${req.path}`)
    return
  }

  const chosenPlugin = await getPluginForRequest(req) || plugins.preparePackageNameForDisplay(req.query.package, version)

  const pageName = `${verb.title} ${chosenPlugin.name}`

  const templatesReturnLink = {
    href: '/manage-prototype/templates',
    text: 'Back to templates'
  }
  const pluginsReturnLink = {
    href: '/manage-prototype/plugins',
    text: 'Back to plugins'
  }

  const returnLink = req.query.returnTo === 'templates' ? templatesReturnLink : pluginsReturnLink

  const fullPluginName = `${chosenPlugin.name}${chosenPlugin.version ? ` version ${chosenPlugin.version} ` : ''}${chosenPlugin.scope ? ` from ${chosenPlugin.scope}` : ''}`

  const pluginHeading = `${verb.title} ${fullPluginName}`
  let dependencyHeading = ''

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
    command: getCommand(mode, chosenPlugin),
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

async function postPluginsStatusHandler (req, res) {
  const mode = getModeFromRequest(req)
  let status = 'processing'
  try {
    if (kitRestarted) {
      const chosenPlugin = await getPluginForRequest(req)
      if (chosenPlugin) {
        if (modeIsComplete(mode, chosenPlugin)) {
          status = 'completed'
        } else if (chosenPlugin.installedLocally && mode === 'uninstall') {
          status = 'completed'
        }
      }
    }
  } catch (e) {
    if (mode !== 'uninstall') {
      console.log(e)
    }
  }
  if (status === 'completed') {
    setKitRestarted(false)
  }
  res.json({ status })
}

async function postPluginsModeMiddleware (req, res, next) {
  // Redirect to the GET route of the same url when the post request is not an ajax request
  if (req.headers['content-type'].indexOf('json') === -1) {
    res.redirect(req.originalUrl)
  } else {
    next()
  }
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
  pluginCacheMiddleware,
  getHomeHandler,
  getTemplatesHandler,
  getTemplatesViewHandler,
  getTemplatesInstallHandler,
  postTemplatesInstallHandler,
  getTemplatesPostInstallHandler,
  getPluginsHandler,
  getPluginsModeHandler,
  postPluginsStatusHandler,
  postPluginsModeMiddleware,
  postPluginsModeHandler
}
