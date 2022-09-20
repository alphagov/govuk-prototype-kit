const requests = require('../routes/api').external
const extensions = require('../extensions/extensions')

// Serve assets from extensions
function setupPathsFor (item) {
  extensions.getPublicUrlAndFileSystemPaths(item)
    .forEach(paths => {
      requests.serveDirectory(paths.publicUrl, paths.fileSystemPath)
    })
}

setupPathsFor('scripts')
setupPathsFor('stylesheets')
setupPathsFor('assets')
