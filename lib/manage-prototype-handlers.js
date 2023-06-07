
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
const { requestHttpsJson, prototypeAppScripts, sortByObjectKey } = require('./utils')
const { projectDir, packageDir, appViewsDir } = require('./utils/paths')
const nunjucksConfiguration = require('./nunjucks/nunjucksConfiguration')
const syncChanges = require('./sync-changes')

const contextPath = '/manage-prototype'

const appViews = plugins.getAppViews([
  path.join(projectDir, 'node_modules'),
  path.join(projectDir, 'app/views/'),
  path.join(packageDir, 'lib/final-backup-nunjucks')
])

const pkgPath = path.join(projectDir, 'package.json')

let kitRestarted = false

const {
  name: currentKitName,
  version: currentKitVersion
} = require(path.join(packageDir, 'package.json'))
const { startPerformanceTimer, endPerformanceTimer } = require('./utils/performance')
const { verboseLog } = require('./utils/verboseLogger')

const latestReleaseVersions = plugins.getKnownPlugins().available
  .reduce((releaseVersions, nextPlugin) => {
    return { ...releaseVersions, [nextPlugin]: 0 }
  }, { 'govuk-prototype-kit': currentKitVersion })

const packageCache = {}

async function lookupPackageInfo (packageName) {
  const timer = startPerformanceTimer()
  const currentTime = Date.now()
  if (packageCache[packageName] && packageCache[packageName].time > currentTime - 30 * 1000){
    console.log('Cached: ' + packageName)
    return packageCache[packageName].packageInfo
  }
  try {
    console.log('Fetching: ' + packageName)
    const packageInfo = await requestHttpsJson(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
    packageCache[packageInfo.name] = {
      time: Date.now(),
      packageInfo: packageInfo
    }
    endPerformanceTimer('lookupPackageInfo (success)', timer)
    return packageInfo
  } catch (e) {
    endPerformanceTimer('lookupPackageInfo (failure)', timer)
    console.log('ignoring error', e.message)
  }
}

async function isValidVersion (packageName, version) {
  const versions = Object.keys(((await lookupPackageInfo(packageName) || {}).versions || {}))
  const isVersionValid = versions.some(distVersion => distVersion === version)
  if (!isVersionValid) {
    console.log('version', version, ' is not valid, valid options are:\n\n', versions)
  }
  return isVersionValid
}

async function lookupLatestPackageVersion (packageName) {
  try {
    const packageInfo = (await lookupPackageInfo(packageName) || {})
    if (config.getConfig().showPrereleases) {
      latestReleaseVersions[packageName] = Object.values(packageInfo['dist-tags'])
        .map(version => ({ version, date: packageInfo.time[version] }))
        .sort(sortByObjectKey('date'))
        .at(-1)
        .version
    } else {
      latestReleaseVersions[packageName] = packageInfo['dist-tags'].latest
    }
    return latestReleaseVersions[packageName]
  } catch (e) {
    verboseLog('Error when looking up latest package')
    verboseLog(e)
    return null
  }
}

async function updateLatestReleaseVersions () {
  const timer = startPerformanceTimer()
  await Promise.all(Object.keys(latestReleaseVersions).map(lookupLatestPackageVersion))
  endPerformanceTimer('updateLatestReleaseVersions', timer)
  return latestReleaseVersions
}

if (!config.getConfig().isTest) {
  updateLatestReleaseVersions()
  setInterval(lookupLatestPackageVersion, 1000 * 60 * 20)
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
  if (config.getConfig().isDevelopment) {
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

  const viewData = {
    currentUrl: req.originalUrl,
    currentSection: pageName,
    links: managementLinks,
    kitUpgradeAvailable: latestReleaseVersions['govuk-prototype-kit'] !== currentKitVersion,
    latestAvailableKit: latestReleaseVersions['govuk-prototype-kit'],
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

function getTemplatesHandler (req, res) {
  const pageName = 'Templates'
  const availableTemplates = getPluginTemplates()

  const commonTemplatesPackageName = '@govuk-prototype-kit/common-templates'
  const govUkFrontendPackageName = 'govuk-frontend'
  let commonTemplatesDetails
  const installedPlugins = plugins.listInstalledPlugins()
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
  if ("!$&'()*+,;=:?#[]@.% ".split('').some((char) => chosenUrl.includes(char))) {
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

function removeDuplicates (val, index, arr) {
  return !arr.includes(val, index + 1)
}

async function getPluginDetails () {
  const pkg = fse.readJsonSync(pkgPath)
  const installed = plugins.listInstalledPlugins()
  return Promise.all(installed.concat(plugins.getKnownPlugins().available)
    .filter(removeDuplicates)
    .map(async (packageName) => {
      // Only those plugins not referenced locally can be looked up
      const reference = pkg.dependencies[packageName] || ''
      const installedLocally = reference.startsWith('file:')
      const latestVersion = !installedLocally && await lookupLatestPackageVersion(packageName)
      return {
        packageName,
        latestVersion,
        installedLocally
      }
    })
    .map(async (packageDetails) => {
      const pack = await packageDetails
      Object.assign(pack, plugins.preparePackageNameForDisplay(pack.packageName), {
        installLink: `${contextPath}/plugins/install?package=${encodeURIComponent(pack.packageName)}`,
        installCommand: `npm install ${pack.packageName}`,
        upgradeCommand: pack.latestVersion && `npm install ${pack.packageName}@${pack.latestVersion}`,
        uninstallCommand: `npm uninstall ${pack.packageName}`
      })
      if (installed.includes(pack.packageName)) {
        const pluginPkgPath = path.join(projectDir, 'node_modules', pack.packageName, 'package.json')
        const pluginPkg = await fse.pathExists(pluginPkgPath) ? await fse.readJson(pluginPkgPath) : {}
        pack.installedVersion = pluginPkg.version
        const mandatoryPlugins = ['govuk-prototype-kit']
        if (!config.getConfig().allowGovukFrontendUninstall) {
          mandatoryPlugins.push('govuk-frontend')
        }
        if (!mandatoryPlugins.includes(pack.packageName)) {
          pack.uninstallLink = `${contextPath}/plugins/uninstall?package=${encodeURIComponent(pack.packageName)}`
        }
      }
      if (pack.latestVersion && pack.installedVersion && pack.installedVersion !== pack.latestVersion) {
        pack.upgradeLink = `${contextPath}/plugins/upgrade?package=${encodeURIComponent(pack.packageName)}`
      }
      return pack
    }))
}

async function prepareForPluginPage () {
  console.time('getPluginDetails')
  const all = await getPluginDetails()
  console.timeEnd('getPluginDetails')

  const installedOut = {}
  const availableOut = {}
  const output = [installedOut, availableOut]

  installedOut.name = 'Installed'
  installedOut.plugins = []
  installedOut.status = 'installed'
  availableOut.name = 'Available'
  availableOut.plugins = []
  availableOut.status = 'available'

  all.forEach(packageInfo => {
    if (packageInfo.installedVersion) {
      installedOut.plugins.push(packageInfo)
    } else if (packageInfo.latestVersion) {
      availableOut.plugins.push(packageInfo)
    }
  })

  return output
}

function getCommand (mode, chosenPlugin) {
  let { upgradeCommand, installCommand, uninstallCommand, version } = chosenPlugin
  if (version && installCommand) {
    installCommand = installCommand + `@${version}`
  }
  switch (mode) {
    case 'upgrade':
      return upgradeCommand + ' --save-exact'
    case 'install':
      return installCommand + ' --save-exact'
    case 'uninstall':
      return uninstallCommand
  }
}

const verbs = {
  upgrade: {
    title: 'Upgrade',
    para: 'upgrade',
    status: 'upgraded',
    progressive: 'upgrading'
  },
  install: {
    title: 'Install',
    para: 'install',
    status: 'installed',
    progressive: 'installing'
  },
  uninstall: {
    title: 'Uninstall',
    para: 'uninstall',
    status: 'uninstalled',
    progressive: 'uninstalling'
  }
}
const pluginData = require('./data/plugins.json')
const newPlugins = require('./data/new-plugins.json').plugins

async function getPluginsViewHandler (req, res) {

  console.time("getPluginForRequest")
  const plugin = await getPluginForRequest(req)
  console.timeEnd("getPluginForRequest")

  Object.assign(plugin, plugin, pluginData[plugin.packageName])
  const model = {
    plugin
  }
  console.dir(model)
  res.render(getManagementView('plugin-view.njk'), model)
}

async function getPluginsHandler (req, res) {
  const path = req.path.replace('/','')
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

  console.time("prepareForPluginPage")
  model.groupsOfPlugins = await prepareForPluginPage()
  console.timeEnd("prepareForPluginPage")
  
  // add new plugin info to existing plugins
  model.groupsOfPlugins.forEach((group) => {
    group.plugins.forEach((plugin) => {
      // console.dir(plugin)
      Object.assign(plugin, plugin, pluginData[plugin.packageName])
    })
  })
  
  // add new plugins
  model.groupsOfPlugins[1].plugins = model.groupsOfPlugins[1].plugins.concat(newPlugins)

  res.render(getManagementView(path + '.njk'), model)
}

async function getPluginForRequest (req) {
  const searchPackage = req.query.package || req.body.package
  const version = req.query.version || req.body.version
  let chosenPlugin
  if (searchPackage) {
    const pluginDetails = await getPluginDetails()
    chosenPlugin = pluginDetails.find(({ packageName }) => packageName === searchPackage)
    if (chosenPlugin && version) {
      if (await isValidVersion(searchPackage, version)) {
        chosenPlugin.version = version
      } else {
        return // chosen plugin will be invalid
      }
    }
  }
  return chosenPlugin
}

function modeIsComplete (mode, { installedVersion, latestVersion, version }) {
  switch (mode) {
    case 'upgrade': return installedVersion === latestVersion
    case 'install': return version ? installedVersion === version : !!installedVersion
    case 'uninstall': return !installedVersion
  }
}

async function getPluginsModeHandler (req, res) {
  const isSameOrigin = req.headers['sec-fetch-site'] === 'same-origin'
  const { mode } = req.params
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

  res.render(getManagementView('plugin-install-or-uninstall.njk'), {
    currentSection: 'Plugins',
    pageName,
    currentUrl: req.originalUrl,
    links: managementLinks,
    chosenPlugin,
    command: getCommand(mode, chosenPlugin),
    verb,
    isSameOrigin,
    returnLink
  })
}

function setKitRestarted (state) {
  kitRestarted = state
}

async function postPluginsStatusHandler (req, res) {
  const { mode } = req.params
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
  const { mode } = req.params

  // Allow smooth upgrade from 13.1.0 as the status route is incorrectly matched
  if (mode === 'status') {
    req.params.mode = 'upgrade'
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
  getHomeHandler,
  getTemplatesHandler,
  getTemplatesViewHandler,
  getTemplatesInstallHandler,
  postTemplatesInstallHandler,
  getTemplatesPostInstallHandler,
  getPluginsHandler,
  getPluginsModeHandler,
  postPluginsStatusHandler,
  getPluginsViewHandler,
  postPluginsModeMiddleware,
  postPluginsModeHandler
}
