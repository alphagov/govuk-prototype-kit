const express = require('express')
const extensions = require('../../extensions/extensions')
const router = express.Router()

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

module.exports = router
