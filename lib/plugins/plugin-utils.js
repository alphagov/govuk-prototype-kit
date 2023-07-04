// This allows npm modules to act as if they are plugins by providing the plugin config for them
function getProxyPluginConfig (packageName) {
  const proxyPluginConfig = {
    jquery: {
      scripts: ['/dist/jquery.js'],
      assets: ['/dist']
    }
  }
  return proxyPluginConfig[packageName] ? { ...proxyPluginConfig[packageName] } : undefined
}

module.exports = {
  getProxyPluginConfig
}
