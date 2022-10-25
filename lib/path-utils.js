const path = require('path')

// Directory locations
exports.packageDir = path.resolve(__dirname, '..')
exports.starterDir = path.join(exports.packageDir, 'prototype-starter')
exports.projectDir = path.resolve(process.env.KIT_PROJECT_DIR || process.cwd())
exports.appDir = path.join(exports.projectDir, 'app')
exports.tempDir = path.join(exports.projectDir, '.tmp')
