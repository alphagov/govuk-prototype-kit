// Based on https://github.com/nickcolley/check-nvmrc

'use strict'

var fs = require('fs')
var path = require('path')

fs.readFile(path.join(__dirname, '.nvmrc'), 'utf8', function (error, data) {
  if (error) throw error
  var expectedVersion = data.trim().replace('v', '')
  var currentVersion = process.version.replace('v', '')

  var versionMatchesExactly = expectedVersion === currentVersion
  if (versionMatchesExactly) {
    process.exit()
  }

  var nvmInstallText = 'To do this you can install nvm (https://github.com/nvm-sh/nvm) then run `nvm install`.'

  console.log('' +
    'Warning: You are using Node.js version ' + currentVersion + ' which we do not use. ' +
    '\n\n' +
    'You may encounter issues, we strongly recommend you install Node.js version ' + expectedVersion + '.' +
    '\n\n' +
    nvmInstallText +
  '')
  process.exit()
})
