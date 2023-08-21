// This allows npm modules to act as if they are plugins by providing the plugin config for them
function getProxyPluginConfig (packageName) {
  const proxyPluginConfig = {
    jquery: {
      scripts: ['/dist/jquery.js'],
      assets: ['/dist'],
      meta: {
        description: 'Add the jQuery JavaScript library to your prototype'
      }
    },
    'notifications-node-client': {
      meta: {
        description: 'Send emails and SMS from GOV.UK Notify'
      }
    }
  }
  return proxyPluginConfig[packageName] ? { ...proxyPluginConfig[packageName] } : undefined
}

module.exports = {
  getProxyPluginConfig
}
