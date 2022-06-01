const fs = require('fs')
const path = require('path')

const repoDir = path.resolve(__dirname, '..', '..')

exports.checkFiles = function () {
  // Warn if node_modules folder doesn't exist
  const nodeModulesExists = fs.existsSync(path.join(repoDir, '/node_modules'))
  if (!nodeModulesExists) {
    console.log('ERROR: Node module folder missing. Try running `npm install`')
    process.exit(0)
  }

  // Create template .env file if it doesn't exist
  const envExists = fs.existsSync(path.join(repoDir, '/.env'))
  if (!envExists) {
    fs.createReadStream(path.join(repoDir, '/lib/template.env'))
      .pipe(fs.createWriteStream(path.join(repoDir, '/.env')))
  }
}
