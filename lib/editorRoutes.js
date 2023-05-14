const fsp = require('fs/promises')
const fse = require('fs-extra')
const express = require('express')
const { NunjucksLoader } = require('./nunjucks/nunjucksConfiguration')
const { getAppViews } = require('./utils/appViews')
const path = require('path')
const { projectDir } = require('./utils/paths')
const editorRouter = express.Router()

const appViews = getAppViews()

const njkLoader = new NunjucksLoader(appViews)

njkLoader.init(appViews)
editorRouter.get('/', (req, res) => {
  res.send({})
})

function fileDescriptor (label, relativePath, type) {
  return {
    label,
    path: relativePath,
    type
  }
}

function loadNunjucks (path) {
  let source
  try {
    source = njkLoader.getSource(path)
  } catch (e) {
    try {
      source = njkLoader.getSource(`${path}/index`)
    } catch (e) {}
  }
  return source
}

async function addIfFileExistsAndCanBeEdited (files, label, relativeOrAbsolutePath, type) {
  const relativePath = relativeOrAbsolutePath.startsWith('/') ? path.relative(projectDir, relativeOrAbsolutePath) : relativeOrAbsolutePath
  if (relativePath.startsWith('node_modules') || relativePath.startsWith('.tmp')) {
    return
  }
  const pathToCheck = path.join(projectDir, relativePath)
  if (await fse.exists(pathToCheck)) {
    files.push(fileDescriptor(label, relativePath, type))
  }
}

editorRouter.get('/files-behind-url', async (req, res) => {
  const { url } = req.query
  if (!url) {
    throw new Error('No URL provided.')
  }
  const view = loadNunjucks(url)
  if (view) {
    const files = []
    await addIfFileExistsAndCanBeEdited(files, 'page', view.path, 'NUNJUCKS')
    const layoutMatch = view.src.match(/\{\s*%\s+extends\s+"([^"]+)"\s*%\s*}/)
    if (layoutMatch) {
      const njk = loadNunjucks(layoutMatch[1])
      await addIfFileExistsAndCanBeEdited(files, 'layout', njk.path, 'NUNJUCKS')
    }
    await addIfFileExistsAndCanBeEdited(files, 'config', 'app/config.json', 'JSON')
    await addIfFileExistsAndCanBeEdited(files, 'javascript', 'app/assets/javascripts/application.js', 'JS')
    await addIfFileExistsAndCanBeEdited(files, 'scss', 'app/assets/sass/application.scss', 'SCSS')
    await addIfFileExistsAndCanBeEdited(files, 'scss settings', 'app/assets/sass/settings.scss', 'SCSS')

    res.send({
      success: true,
      files
    })
  } else {
    res.send({
      success: false,
      error: {}
    })
  }
})

const checkFilePath = function (req, res, next) {
  const { filePath } = req.query
  if (!filePath) {
    res.status(400)
    res.send({
      success: false,
      reason: 'No filePath provided (in query string)'
    })
  } else if (filePath.includes('..')) {
    res.status(403)
    res.send({
      success: false,
      reason: 'FilePath seems to be traversing using "..", that\'s not allowed here'
    })
  } else if (filePath.includes('node_modules')) {
    res.status(403)
    res.send({
      success: false,
      reason: 'FilePath seems to be inside node_modules, that\'s not allowed here'
    })
  } else {
    next()
  }
}

editorRouter.get('/file-contents', [checkFilePath], async (req, res) => {
  const { filePath } = req.query

  try {
    const contents = await fsp.readFile(path.join(projectDir, filePath), 'utf8')

    res.send({ success: true, contents })
  } catch (e) {
    console.error(e)
    res.status(500)
    res.send({
      success: false,
      error: {
        message: e.message
      }
    })
  }
})

editorRouter.post('/file-contents', [checkFilePath], async (req, res) => {
  const { filePath } = req.query
  const { contents, mode } = req.body
  const fullPath = path.join(projectDir, filePath)

  if (mode === 'write') {
    await fsp.writeFile(fullPath, contents)
    res.send({ success: true })
  } else if (mode === 'delete') {
    await fse.remove(fullPath)
    res.send({ success: true })
  }
})

module.exports = {
  editorRouter
}
