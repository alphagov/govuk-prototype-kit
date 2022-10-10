const path = require('path')

// Directory locations
exports.packageDir = path.resolve(__dirname, '..')
exports.projectDir = process.cwd()
exports.appDir = path.join(exports.projectDir, 'app')
exports.tempDir = path.join(exports.projectDir, '.tmp')
