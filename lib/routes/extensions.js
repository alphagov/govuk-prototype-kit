const express = require('express')

const router = require('../../index').requests.setupRouter()
const extensions = require('../extensions/extensions')

// Serve assets from extensions
function setupPathsFor (item) {
  extensions.getPublicUrlAndFileSystemPaths(item)
    .forEach(paths => {
      router.use(paths.publicUrl, express.static(paths.fileSystemPath))
    })
}

setupPathsFor('scripts')
setupPathsFor('stylesheets')
setupPathsFor('assets')
