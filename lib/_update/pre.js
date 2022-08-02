const { updatePackageJson } = require('./update-package-json')

;(async function () {
  await updatePackageJson()
})()
