const fs = require('fs')
const path = require('path')

// Warning: Do not require external dependencies in this file.

const packageDir = path.resolve(__dirname, '..', '..')
const projectDir = process.cwd()

exports.checkFiles = function () {
  // Warn if node_modules folder doesn't exist
  const nodeModulesExists = fs.existsSync(path.join(projectDir, '/node_modules'))
  if (!nodeModulesExists) {
    console.log('ERROR: Node module folder missing. Try running `npm install`')
    process.exit(0)
  }

  // Create template .env file if it doesn't exist
  const envExists = fs.existsSync(path.join(projectDir, '/.env'))
  if (!envExists) {
    fs.createReadStream(path.join(packageDir, '/lib/template.env'))
      .pipe(fs.createWriteStream(path.join(projectDir, '/.env')))
  }
}
