const templateRenderNunjucks = require('nunjucks')
const fse = require('fs-extra')

const router = require('../../index').requests.setupRouter('/manage-prototype')
const redirectingRouter = require('../../index').requests.setupRouter('/prototype-admin')

const { projectDir } = require('../path-utils')
const path = require('path')
const extensions = require('../extensions/extensions')
const { urlencode } = require('nunjucks/src/filters')

const appViews = extensions.getAppViews([
  path.join(projectDir, 'node_modules'),
  path.join(projectDir, 'app/views/')
])

templateRenderNunjucks.configure(appViews, {
    autoescape: true,
    noCache: true,
    watch: false // We are now setting this to `false` (it's by default false anyway) as having it set to `true` for production was making the tests hang
  }
)

function getManagementView (filename) {
  return ['govuk-prototype-kit', 'internal', 'views', 'manage-prototype', filename].join('/')
}

redirectingRouter.use((req, res, next) => {
  res.redirect(req.originalUrl.replace('/prototype-admin', '/manage-prototype'))
})

// Local dependencies
const encryptPassword = require('../utils').encryptPassword

const password = process.env.PASSWORD

// Clear all data in session
router.post('/clear-data', function (req, res) {
  req.session.data = {}
  res.render('prototype-admin/clear-data-success')
})

// Render password page with a returnURL to redirect people to where they came from
router.get('/password', function (req, res) {
  const returnURL = req.query.returnURL || '/'
  const error = req.query.error
  res.render('prototype-admin/password', { returnURL, error })
})

// Check authentication password
router.post('/password', function (req, res) {
  const submittedPassword = req.body._password
  const returnURL = req.body.returnURL

  if (submittedPassword === password) {
    // see lib/middleware/authentication.js for explanation
    res.cookie('authentication', encryptPassword(password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: 'None', // Allows GET and POST requests from other domains
      httpOnly: true,
      secure: true
    })
    res.redirect(returnURL)
  } else {
    res.redirect('/prototype-admin/password?error=wrong-password&returnURL=' + encodeURIComponent(returnURL))
  }
})

const managementLinks = [
  {
    text: 'Home',
    url: '/manage-prototype'
  },
  {
    text: 'Templates',
    url: '/manage-prototype/templates'
  },
  {
    text: 'Plug-ins',
    url: '/manage-prototype/plugins'
  }
]

router.get('/', (req, res) => {
  const pageName = 'Home'
  res.render(getManagementView('index.njk'), {
    currentPage: pageName,
    links: managementLinks
  })
})

function exampleTemplateConfig (packageName, { name, path }) {
  const queryString = `?package=${urlencode(packageName)}&template=${urlencode(path)}`
  return {
    name,
    path: require('path').join(packageName, path),
    installLink: `/manage-prototype/templates/install${queryString}`,
    viewLink: `/manage-prototype/templates/view${queryString}`
  }
}

function getPluginTemplates () {
  const entriesByType = extensions.getByType('templates')
  const output = []
  entriesByType.forEach(({ packageName, item }) => {
    const matchingPackages = output.filter(x => x.packageName === packageName)
    let packageDescription
    if (matchingPackages.length > 0) {
      packageDescription = matchingPackages[0]
    } else {
      packageDescription = {
        packageName,
        pluginDisplayName: packageName.toUpperCase(),
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
  const packageTemplates = getPluginTemplates().filter(({ packageName }) => req.query.package)
  if (packageTemplates.length > 0) {
    const templates = packageTemplates[0].templates.filter(({ path }) => {
      const pathToMatch = [packageTemplates[0].packageName, req.query.template].join('')
      return path === pathToMatch
    })
    if (templates.length > 0) {
      return templates[0]
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
      currentUrl: req.originalUrl,
      templateName: templateConfig.name
    })
  } else {
    res.status(404).send('Template not found.')
  }
})

router.post('/templates/install', async (req, res) => {
  const templateConfig = locateTemplateConfig(req)
  const templatePath = path.join(projectDir, 'node_modules', templateConfig.path)

  const chosenUrl = req.body['chosen-url']

  const pageToInstall = path.join(projectDir, 'app', 'views', `${chosenUrl}.html`)

  await fse.ensureDir(path.dirname(pageToInstall))
  await fse.copy(templatePath, pageToInstall)

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

router.get('/plugins', (req, res) => {
  const pageName = 'Plug-ins'
  res.render(getManagementView('plugins.njk'), {
    currentPage: pageName,
    links: managementLinks
  })
})

module.exports = router
