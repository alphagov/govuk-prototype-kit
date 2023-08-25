// This allows npm modules to act as if they are plugins by providing the plugin config for them
function getProxyPluginConfig (packageName) {
  const proxyPluginConfig = {
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
  return proxyPluginConfig[packageName] ? { ...proxyPluginConfig[packageName] } : undefined
}

module.exports = {
  getProxyPluginConfig
}
