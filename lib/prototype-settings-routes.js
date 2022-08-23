// NPM dependencies
const path = require('path')

const express = require('express')
const fs = require('fs-extra')

// Local dependencies
const encryptPassword = require('./utils').encryptPassword
const extensions = require('./extensions/extensions')
const { projectDir } = require('./path-utils')

const router = express.Router()
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
      httpOnly: true, secure: true
    })
    res.redirect(returnURL)
  } else {
    res.redirect('/prototype-admin/password?error=wrong-password&returnURL=' + encodeURIComponent(returnURL))
  }
})

router.get('/', (req, res) => {
  res.render(path.join('govuk-prototype-kit', 'prototype-settings', 'index.html'))
})
router.get('/data', (req, res) => {
  res.render(path.join('govuk-prototype-kit', 'prototype-settings', 'data.html'), {
    currentData: JSON.stringify(req.session.data, null, 2), postUrl: req.originalUrl
  })
})
router.post('/data', (req, res) => {
  const redirectUrl = req.originalUrl
  const redirect = () => res.redirect(redirectUrl)
  const store = data => { req.session.data = data }
  const action = req.body.perform
  const actions = {
    update: () => {
      const data = JSON.parse(req.body['session-data'])
      store(data)
      redirect()
    },
    clear: () => {
      store({})
      redirect()
    },
    import: () => {
      const fileMeta = req.files['session-data-import']
      const jsonString = fileMeta.data.toString()
      const json = JSON.parse(jsonString)
      store(json)
      redirect()
    },
    'export': () => {
      const downloadsDir = path.join(projectDir, '.tmp', 'downloads')
      const filePath = path.join(downloadsDir, '' + Date.now() + '.json')
      fs.ensureDirSync(downloadsDir)
      fs.writeJsonSync(filePath, JSON.parse(req.body['session-data']))
      setTimeout(() => {
        fs.remove(filePath)
      }, 30000)
      res.set({
        Location: redirectUrl
      })
      res.download(filePath, 'govuk-prototype-kit-session.json')
    }
  }
  actions[action]()
})
router.get('/data/clear', (req, res) => {
  res.render(path.join('govuk-prototype-kit', 'prototype-settings', 'data-clear.html'))
})
router.get('/data/import', (req, res) => {
  res.render(path.join('govuk-prototype-kit', 'prototype-settings', 'data-import.html'))
})
router.get('/extensions', async (req, res) => {
  const installedExtensions = extensions.getInstalledExtensions()
  Promise.all(installedExtensions.map(name => fs.readJson(path.join(projectDir, 'node_modules', name, 'package.json'))
    .then(json => ({ name: json.name, version: json.version }))
    .catch((e) => {
      console.warn('caught an error')
      console.warn(e.message)
    })))
    .then(extensions => {
      const filteredExtensions = extensions.filter(a => a !== undefined)

      const installed = filteredExtensions
      const installedNames = filteredExtensions.map(x => x.name)
      const known = [{
        name: '@hmcts/frontend', version: '0.0.50-alpha'
      }, {
        name: 'govuk-frontend', version: '4.3.1'
      }, {
        name: 'hmrc-frontend', version: '5.4.0'
      }, {
        name: '@govuk-prototype-kit/step-by-step', version: '2.0.0'
      }]

      function generateVersionLIne (extension) {
        const parts = [extension.version]
        const knownExtension = known.find(x => x.name === extension.name)
        if (knownExtension && knownExtension.version !== extension.version) {
          parts.push(`(v${knownExtension.version} available)`)
        }
        return parts.join(' ')
      }

      const prepare = arr => arr
        .map(extension => {
          const out = Object.assign({}, extension)
          out.url = `https://www.npmjs.com/package/${extension.name}`
          if (out.version) {
            out.url += `/v/${out.version}`
          }
          return out
        })
        .sort(extension => extension.name === 'govuk-prototype-kit' ? -1 : 0)
        .map(extension => ({
          key: {
            html: `<a href="${extension.url}">${extension.name}</a>`, classes: 'govuk-!-font-weight-regular'
          },
          value: {
            text: generateVersionLIne(extension)
          }
        }))

      return {
        installed: prepare(installed), available: prepare(known.filter(x => !installedNames.includes(x.name)))
      }
    })
    .then(installedAndAvailable => {
      res.render(path.join('govuk-prototype-kit', 'prototype-settings', 'extensions.html'), {
        installedExtensionRows: installedAndAvailable.installed, availableExtensionRows: installedAndAvailable.available
      })
    })
})
module.exports = router
