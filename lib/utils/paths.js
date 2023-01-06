
// core dependencies
const path = require('path')

// Root locations
exports.packageDir = path.resolve(__dirname, '..', '..')
exports.projectDir = path.resolve(process.env.KIT_PROJECT_DIR || process.cwd())
exports.starterDir = path.join(exports.packageDir, 'prototype-starter')

// Locations in prototype dir
exports.appDir = path.join(exports.projectDir, 'app')
exports.appAssetsDir = path.join(exports.appDir, 'assets')
exports.appSassDir = path.join(exports.appAssetsDir, 'sass')

// Locations in package dir
exports.libDir = path.join(exports.packageDir, 'lib')
exports.libAssetsDir = path.join(exports.libDir, 'assets')
exports.libSassDir = path.join(exports.libAssetsDir, 'sass')

// Locations in tmp dir
exports.tmpDir = path.join(exports.projectDir, '.tmp')
exports.tmpSassDir = path.join(exports.tmpDir, 'sass')
exports.publicDir = path.join(exports.tmpDir, 'public')
exports.publicCssDir = path.join(exports.publicDir, 'stylesheets')
exports.sessionStoreDir = path.join(exports.tmpDir, 'sessions')
exports.shadowNunjucksDir = path.join(exports.tmpDir, 'shadow-nunjucks')
