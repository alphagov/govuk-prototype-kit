const fs = require('fs-extra')
const path = require('path')

const validatePlugin = (pluginName) => {
    if (pluginName != null) {
        const executionPath = process.cwd()
        const pathToPlugin = path.join(executionPath, pluginName)
        console.log(`Trying to validate that ${pathToPlugin} exists`)
        fs.exists(pathToPlugin).then(exists => {
          if (exists) {
            const pluginConfig = path.join(pathToPlugin,'govuk-prototype-kit.config.json')
            fs.exists(pluginConfig). then(exists => {
              if (exists) {
                console.log(`Config file exists, validating contents.`)
              } else {
                console.log(`The plugin does not seem to have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.`)
              }
            }) 
          } else {
            console.log(`Could not find plugin named ${pluginName}`)
          }
        })
      } else {
        console.log('validate-plugin requires a plugin name e.g. npx govuk-prototype validate-plugin <plugin_name>')
      }
}


module.exports = {
  validatePlugin
}