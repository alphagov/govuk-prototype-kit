const requests = require('../../index').requests
const plugins = require('./plugins')

// Serve assets from plugins
function setupPathsFor (item) {
  plugins.getPublicUrlAndFileSystemPaths(item)
    .forEach(paths => {
      requests.serveDirectory(paths.publicUrl, paths.fileSystemPath)
      // Keep /extension-assets path for backwards compatibility
      // TODO: remove in a breaking release
      requests.serveDirectory(
        paths.publicUrl.replace('plugin-assets', 'extension-assets'), paths.fileSystemPath)
    })
}

setupPathsFor('scripts')
setupPathsFor('stylesheets')
setupPathsFor('assets')
