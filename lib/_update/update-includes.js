const { getProjectVersion, patchUserFile } = require('./util')

async function updateIncludes () {
  const userVersion = await getProjectVersion()

  // If the user already has version 13 or greater of the kit installed then
  // their application.js file is all their code and we don't don't want to
  // change it
  if (userVersion >= '13.0.0') {
    return
  }

  await patchUserFile(userVersion, 'app/views/includes/head.html')
  await patchUserFile(userVersion, 'app/views/includes/scripts.html')
}

module.exports = {
  updateIncludes
}
