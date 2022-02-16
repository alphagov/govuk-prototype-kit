// Core dependencies
const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises
const log = require('fancy-log')
const nodemon = require('nodemon')
const colour = require('ansi-colors')
const sass = require('node-sass')

const extensions = require('./lib/extensions/extensions')
const config = require('./config.json')

checkFiles()

// Local dependencies
const usageData = require('./lib/usage_data')

// Get usageDataConfig from file, if exists
const usageDataConfig = usageData.getUsageDataConfig()

if (usageDataConfig.collectUsageData === undefined) {
  // No recorded answer, so ask for permission
  const promptPromise = usageData.askForUsageDataPermission()
  promptPromise.then(function (permissionGranted) {
    usageDataConfig.collectUsageData = permissionGranted
    usageData.setUsageDataConfig(usageDataConfig)

    if (permissionGranted) {
      usageData.startTracking(usageDataConfig)
    }

    compileSass().then(runServer)
  })
} else if (usageDataConfig.collectUsageData === true) {
  // Opted in
  usageData.startTracking(usageDataConfig)
  compileSass().then(runServer)
} else {
  // Opted out
  compileSass().then(runServer)
}

// Warn if node_modules folder doesn't exist
function checkFiles () {
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '/node_modules'))
  if (!nodeModulesExists) {
    console.error('ERROR: Node module folder missing. Try running `npm install`')
    process.exit(0)
  }

  // Create template .env file if it doesn't exist
  const envExists = fs.existsSync(path.join(__dirname, '/.env'))
  if (!envExists) {
    fs.createReadStream(path.join(__dirname, '/lib/template.env'))
      .pipe(fs.createWriteStream(path.join(__dirname, '/.env')))
  }
}

// Create template session data defaults file if it doesn't exist
const dataDirectory = path.join(__dirname, '/app/data')
const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

if (!sessionDataDefaultsFileExists) {
  console.log('Creating session data defaults file')
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
  }

  fs.createReadStream(path.join(__dirname, '/lib/template.session-data-defaults.js'))
    .pipe(fs.createWriteStream(sessionDataDefaultsFile))
}

// generate assets
// clean
// sass-extensions
// sass
// copy-assets
// sass-documentation
// copy-assets-documentation

// watch
// run server

function prepareSassExtensions () {
  return new Promise((resolve, reject) => {
    const fileContents = '$govuk-extensions-url-context: "/extension-assets"; ' + extensions.getFileSystemPaths('sass')
      .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
      .join('\n')
    fs.writeFile(path.join(config.paths.lib + 'extensions', '_extensions.scss'), fileContents, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const includePaths = [
  path.join(__dirname, 'app', 'assets', 'sass'),
  path.join(__dirname, 'node_modules', 'govuk-frontend', 'govuk'),
  path.join(__dirname)
]

function addPathToList (fullListToAttempt, fullPath) {
  fullListToAttempt.push(fullPath)

  const pathParts = fullPath.split(path.sep)
  const filename = pathParts.pop()
  pathParts.push(`_${filename}`)
  fullListToAttempt.push(`${pathParts.join(path.sep)}`)
}

function sassImporter (url, prev, done) {
  const fullListToAttempt = []
  addPathToList(fullListToAttempt, url)
  ;[path.dirname(prev)].concat(includePaths).forEach(root => {
    const fullPath = path.join(root, url)
    addPathToList(fullListToAttempt, fullPath)
    addPathToList(fullListToAttempt, `${fullPath}.scss`)
  })
  Promise.all(fullListToAttempt.map(fullPath => {
    const result = {}
    result.fullPath = fullPath
    try {
      const stats = fs.statSync(result.fullPath)
      if (stats) {
        if (stats.isFile()) {
          result.exists = true
          return Promise.resolve(result)
        } else {
          result.exists = false
          return Promise.resolve(result)
        }
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        result.exists = false
        return Promise.resolve(result)
      } else {
        console.log('caught unexpected', e)
        process.exit(1)
      }
    }
  }))
    .then(results => {
      let firstResult
      results.forEach(result => {
        if (result.exists) {
          if (firstResult) {
            // console.warn('Duplicate result found:')
            // console.warn(`Using:     ${firstResult.fullPath}`)
            // console.warn(`Duplicate: ${result.fullPath}`)
          } else {
            firstResult = result
          }
        }
      })
      if (!firstResult) {
        throw new Error(`No SASS import available for [${url}] (prev [${prev}]), attempted to use ${fullListToAttempt.map(x => `[${x}]`).join(', ')}`)
      }
      done({
        file: firstResult.fullPath,
        contents: fs.readFileSync(firstResult.fullPath, 'utf8')
      })
    })
}

function renderSassFile (fileName) {
  return new Promise((resolve, reject) => {
    sass.render({
      file: path.join(__dirname, 'app', 'assets', 'sass', fileName + '.scss'),
      sourceMap: true,
      importer: sassImporter,
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function compileSassFile (fileName) {
  return renderSassFile(fileName).then(result => {
    return fsPromises.writeFile(path.join(__dirname, 'compiled', 'stylesheets', fileName + '.css'), result.css)
  })
}

function compileSass () {
  return prepareSassExtensions().then(Promise.all([
    compileSassFile('application'),
    compileSassFile('application-ie8'),
    compileSassFile('unbranded'),
    compileSassFile('unbranded-ie8')
  ]))
}

function runServer () {
// Warn about npm install on crash
  const onCrash = () => {
    log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

// Remove .port.tmp if it exists
  const onQuit = () => {
    try {
      fs.unlinkSync(path.join(__dirname, '/../.port.tmp'))
    } catch (e) {}

    process.exit(0)
  }

  nodemon({
    watch: ['.env', '**/*.js', '**/*.json'],
    script: 'listen-on-port.js',
    ignore: [
      config.paths.public + '*',
      config.paths.assets + '*',
      config.paths.nodeModules + '*'
    ]
  })
    .on('crash', onCrash)
    .on('quit', onQuit)
}
