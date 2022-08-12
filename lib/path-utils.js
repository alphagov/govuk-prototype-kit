
// Directory locations
const path = require('path')
exports.packageDir = path.resolve(__dirname, '..')
exports.projectDir = process.cwd()
exports.appDir = path.join(exports.projectDir, 'app')
