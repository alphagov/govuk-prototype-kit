// This allows npm modules to act as if they are plugins by providing the plugin config for them
const fs = require('fs')
const fse = require('fs-extra')
const { projectDir } = require('../utils/paths')
const path = require('path')

let proxyPluginError = false
function getProxyPluginConfig (packageName) {
  let proxyPluginConfig = {
    jquery: {
      scripts: ['/dist/jquery.js'],
      assets: ['/dist'],
      meta: {
        description: 'jQuery is a fast, small, and feature-rich JavaScript library. It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API that works across a multitude of browsers.'
      }
    },
    'notifications-node-client': {
      meta: {
        description: 'GOV.UK Notify makes it easy for public sector service teams to send emails, text messages and letters.'
      }
    }
  }
  const proxyPluginsPath = path.join(projectDir, 'app', 'plugin-proxy.json')
  if (fse.existsSync(proxyPluginsPath)) {
    let userProxyPluginsContent
    try {
      userProxyPluginsContent = fs.readFileSync(proxyPluginsPath, 'utf8')
      const userProxyPlugins = JSON.parse(userProxyPluginsContent)
      proxyPluginConfig = { ...proxyPluginConfig, ...userProxyPlugins }
      proxyPluginError = false
    } catch (err) {
      if (!proxyPluginError) {
        console.error(err.message)
        console.error(proxyPluginsPath)
        console.error(userProxyPluginsContent)
        proxyPluginError = true
      }
    }
  }
  return proxyPluginConfig[packageName] ? { ...proxyPluginConfig[packageName] } : undefined
}

module.exports = {
  getProxyPluginConfig
}
