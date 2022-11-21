const templateRenderNunjucks = require('nunjucks')
const fse = require('fs-extra')
const querystring = require('querystring')

const contextPath = '/manage-prototype'
const router = require('../../index').requests.setupRouter(contextPath)
const redirectingRouter = require('../../index').requests.setupRouter('/manage-prototype')

const { projectDir, packageDir } = require('../path-utils')
const path = require('path')
const extensions = require('../extensions/extensions')
const config = require('../config').getConfig()
const { requestHttpsJson } = require('../utils')
const { exec } = require('../exec')

const appViews = extensions.getAppViews([
  path.join(projectDir, 'node_modules'),
  path.join(projectDir, 'app/views/')
])

const currentKitVersion = require(path.join(packageDir, 'package.json')).version
const knownPlugins = require(path.join(packageDir, 'known-plugins.json'))

const latestReleaseVersions = knownPlugins.plugins.available
  .reduce((releaseVersions, nextPlugin) => {
    return { ...releaseVersions, [nextPlugin]: 0 }
  }, { 'govuk-prototype-kit': currentKitVersion })

const lookupLatestPackageVersion = async (packageName) => {
  try {
    const packageInfo = await requestHttpsJson(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
    latestReleaseVersions[packageName] = packageInfo['dist-tags'].latest
  } catch (e) {
    console.log('ignoring error', e.message)
  }
  return latestReleaseVersions[packageName]
}

const updateLatestReleaseVersions = async () => {
  await Promise.all(Object.keys(latestReleaseVersions).map(lookupLatestPackageVersion))
  return latestReleaseVersions
}

if (process.env.IS_INTEGRATION_TEST !== 'true') {
  updateLatestReleaseVersions()
  setInterval(lookupLatestPackageVersion, 1000 * 60 * 20)
}

templateRenderNunjucks.configure(appViews, {
  autoescape: true,
  noCache: true,
  watch: false // We are now setting this to `false` (it's by default false anyway) as having it set to `true` for production was making the tests hang
})

function getManagementView (filename) {
  return ['govuk-prototype-kit', 'internal', 'views', 'manage-prototype', filename].join('/')
}

redirectingRouter.use((req, res, next) => {
  res.redirect(req.originalUrl.replace('/manage-prototype', contextPath))
})

// Local dependencies
const encryptPassword = require('../utils').encryptPassword

const password = process.env.PASSWORD

// Clear all data in session
router.get('/clear-data', function (req, res) {
  res.render(getManagementView('clear-data.njk'))
})

router.post('/clear-data', function (req, res) {
  req.session.data = {}
  res.render(getManagementView('clear-data-success.njk'))
})

// Render password page with a returnURL to redirect people to where they came from
router.get('/password', function (req, res) {
  const returnURL = req.query.returnURL || '/'
  const error = req.query.error
  res.render(getManagementView('password.njk'), { returnURL, error })
})

// Check authentication password
router.post('/password', function (req, res) {
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
})

// Middleware to ensure the routes specified below will render the manage-prototype-not-available
// view when the prototype is not running in development
router.use((req, res, next) => {
  if (config.isDevelopment) {
    next()
  } else {
    res.render(getManagementView('manage-prototype-not-available.njk'))
  }
})

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

router.get('/', async (req, res) => {
  const pageName = 'Home'

  const originalHomepage = await fse.readFile(path.join(packageDir, 'prototype-starter', 'app', 'views', 'index.html'), 'utf8')
  const currentHomepage = await readFileIfExists(path.join(projectDir, 'app', 'views', 'index.html'))

  res.render(getManagementView('index.njk'), {
    currentUrl: req.originalUrl,
    currentPage: pageName,
    links: managementLinks,
    kitUpgradeAvailable: latestReleaseVersions['govuk-prototype-kit'] !== currentKitVersion,
    latestAvailableKit: latestReleaseVersions['govuk-prototype-kit'],
    tasks: [
      {
        done: config.serviceName !== 'Service name goes here' && config.serviceName !== 'GOV.UK Prototype Kit',
        html: 'Change the service name in the file <strong>app/config.json</strong>'
      }, {
        done: currentHomepage !== undefined && originalHomepage !== currentHomepage,
        html: 'Edit the homepage in the file <strong>app/views/index.html</strong>'
      }
    ]

  })
})

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
  const templates = extensions.getByType('templates')
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
        pluginDisplayName: extensions.preparePackageNameForDisplay(packageName),
        templates: []
      }
      output.push(packageDescription)
    }
    packageDescription.templates.push(exampleTemplateConfig(packageName, item))
  })
  return output
}

router.get('/templates', (req, res) => {
  const pageName = 'Templates'
  res.render(getManagementView('templates.njk'), {
    currentPage: pageName,
    links: managementLinks,
    availableTemplates: getPluginTemplates()
  })
})

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

router.get('/templates/view', (req, res) => {
  const model = {
    extensionConfig: {
      scripts: ['/public/javascripts/application.js'],
      stylesheets: ['/public/stylesheets/application.css']
    },
    serviceName: 'Service name goes here'
  }
  const templateConfig = locateTemplateConfig(req)

  if (templateConfig) {
    const renderPath = templateConfig.path
    res.send(templateRenderNunjucks.render(renderPath, model))
  } else {
    res.status(404).send('Template not found.')
  }
})

router.get('/templates/install', (req, res) => {
  const templateConfig = locateTemplateConfig(req)

  if (templateConfig) {
    res.render(getManagementView('template-install.njk'), {
      currentPage: 'Templates',
      currentUrl: req.originalUrl,
      links: managementLinks,
      templateName: templateConfig.name,
      error: ({
        exists: 'The chosen URL already exists',
        slash: 'The URL must begin with a forward slash (/)'
      })[req.query.errorType],
      chosenUrl: req.query['chosen-url']
    })
  } else {
    res.status(404).send('Template not found.')
  }
})

router.post('/templates/install', async (req, res) => {
  const templateConfig = locateTemplateConfig(req)
  const templatePath = path.join(projectDir, 'node_modules', templateConfig.path)

  const chosenUrl = req.body['chosen-url']

  const installLocation = path.join(projectDir, 'app', 'views', `${chosenUrl}.html`)

  const renderError = (errorType) => {
    const query = querystring.stringify({
      ...req.query,
      'chosen-url': req.body['chosen-url'],
      errorType
    })
    const url = `${req.originalUrl.split('?')[0]}?${query}`
    res.redirect(url)
  }

  if (chosenUrl[0] !== '/') {
    renderError('slash')
    return
  }

  if (await fse.exists(installLocation)) {
    renderError('exists')
    return
  }

  await fse.ensureDir(path.dirname(installLocation))
  await fse.copy(templatePath, installLocation)

  res.redirect(`/manage-prototype/templates/post-install?chosen-url=${encodeURIComponent(chosenUrl)}`)
})

router.get('/templates/post-install', (req, res) => {
  const pageName = 'Templates'
  const chosenUrl = req.query['chosen-url']

  res.render(getManagementView('template-post-install.njk'), {
    currentPage: pageName,
    links: managementLinks,
    url: chosenUrl,
    filePath: path.join('app', 'views', `${chosenUrl}.html`)
  })
})

const removeDuplicates = (val, index, arr) => !arr.includes(val, index + 1)

async function getPluginDetails () {
  const installed = extensions.listInstalledExtensions()
  const all = await Promise.all(installed.concat(knownPlugins.plugins.available)
    .filter(removeDuplicates)
    .map(async (packageName) => ({
      packageName,
      latestVersion: await lookupLatestPackageVersion(packageName)
    }))
    .map(async (packageDetails) => {
      const pack = await packageDetails
      Object.assign(pack, extensions.preparePackageNameForDisplay(pack.packageName), {
        installLink: `${contextPath}/plugins/install?package=${encodeURIComponent(pack.packageName)}&mode=install`,
        installCommand: `npm install ${pack.packageName}`,
        upgradeCommand: `npm install ${pack.packageName}@${pack.latestVersion}`,
        uninstallCommand: `npm uninstall ${pack.packageName}`
      })
      if (installed.includes(pack.packageName)) {
        pack.installedVersion = (await fse.readJson(path.join(projectDir, 'node_modules', pack.packageName, 'package.json'))).version
        if (!['govuk-prototype-kit', 'govuk-frontend'].includes(pack.packageName)) {
          pack.uninstallLink = `${contextPath}/plugins/uninstall?package=${encodeURIComponent(pack.packageName)}`
        }
      } else {
      }
      if (pack.installedVersion && pack.installedVersion !== pack.latestVersion) {
        pack.upgradeLink = `${contextPath}/plugins/install?package=${encodeURIComponent(pack.packageName)}&mode=upgrade`
      }
      return pack
    }))
  return all
}

const prepareForPluginPage = async () => {
  const all = await getPluginDetails()

  const installedOut = {}
  const availableOut = {}
  const output = [installedOut, availableOut]

  installedOut.name = 'Installed'
  installedOut.plugins = []
  availableOut.name = 'Available'
  availableOut.plugins = []

  all.forEach(packageInfo => {
    if (packageInfo.installedVersion) {
      installedOut.plugins.push(packageInfo)
    } else {
      availableOut.plugins.push(packageInfo)
    }
  })

  return output
}

router.get('/plugins', async (req, res) => {
  const pageName = 'Plugins'
  const model = {
    currentPage: pageName,
    links: managementLinks,
    mode: req.query.mode
  }

  const isSuccessResult = !!req.query.success

  function getVerb () {
    const mode = req.query.mode
    if (mode === 'upgrade') {
      return 'upgraded'
    } else if (mode === 'install') {
      return 'installed'
    } else if (mode === 'uninstall') {
      return 'uninstalled'
    }
  }

  if (isSuccessResult) {
    model.successBanner = {
      package: extensions.preparePackageNameForDisplay(req.query.success),
      mode: req.query.mode,
      verb: getVerb()
    }
  }

  setTimeout(async () => {
    model.groupsOfPlugins = await prepareForPluginPage()
    res.render(getManagementView('plugins.njk'), model)
  }, isSuccessResult ? 1000 : 0)
})

async function getPluginForRequest (req) {
  const searchPackage = req.query.package
  const chosenPlugin = (await getPluginDetails())
    .filter(({ packageName }) => packageName === searchPackage)[0]
  return chosenPlugin
}

router.get('/plugins/install', async (req, res) => {
  const pageName = 'Plugins'
  const chosenPlugin = await getPluginForRequest(req)

  if (!chosenPlugin) {
    res.status(404).send('Plugin not found')
    return
  }

  res.render(getManagementView('plugin-install-or-uninstall.njk'), {
    currentPage: pageName,
    currentUrl: req.originalUrl,
    links: managementLinks,
    chosenPlugin,
    command: req.query.mode === 'upgrade' ? chosenPlugin.upgradeCommand : chosenPlugin.installCommand,
    verb: {
      title: req.query.mode === 'upgrade' ? 'Upgrade' : 'Install',
      para: req.query.mode === 'upgrade' ? 'upgrade' : 'install',
      status: req.query.mode === 'upgrade' ? 'upgraded' : 'installed'
    }
  })
})

router.post('/plugins/install', async (req, res) => {
  const chosenPlugin = await getPluginForRequest(req)
  res.render(getManagementView('plugin-install-process.njk'), {
    chosenPlugin,
    verb: {
      title: req.query.mode === 'upgrade' ? 'Upgrading' : 'Installing',
      para: req.query.mode === 'upgrade' ? 'upgrading' : 'installing'
    }
  })
  try {
    await exec(chosenPlugin.installCommand, { cwd: projectDir })
  } catch (e) {
    res.status(500).send(['Something went wrong', e.message, e.stack].join('br/'))
  }
})

router.get('/plugins/uninstall', async (req, res) => {
  const pageName = 'Plugins'
  const chosenPlugin = await getPluginForRequest(req)

  if (!chosenPlugin) {
    res.status(404).send('Plugin not found')
    return
  }
  res.render(getManagementView('plugin-install-or-uninstall.njk'), {
    currentPage: pageName,
    currentUrl: req.originalUrl,
    links: managementLinks,
    command: chosenPlugin.uninstallCommand,
    chosenPlugin,
    verb: {
      title: 'Uninstall',
      para: 'uninstall',
      status: 'uninstalled'
    }
  })
})

router.post('/plugins/uninstall', async (req, res) => {
  const chosenPlugin = await getPluginForRequest(req)
  res.render(getManagementView('plugin-install-process.njk'), {
    chosenPlugin,
    verb: {
      title: 'Uninstalling',
      para: 'uninstalling'
    }
  })
  try {
    await exec(chosenPlugin.uninstallCommand, { cwd: projectDir })
  } catch (e) {
    res.status(500).send(['Something went wrong', e.message, e.stack].join('br/'))
  }
})

module.exports = router
