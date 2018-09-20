// Use this file to change prototype configuration.

// Note: prototype config can be overridden using environment variables (eg on heroku)

module.exports = {
  // Service name used in header. Eg: 'Renew your passport'
  serviceName: 'Service name goes here',

  // Default port that prototype runs on
  port: '3000',

  // Enable or disable password protection on production
  useAuth: 'true',

  // Automatically stores form data, and send to all views
  useAutoStoreData: 'true',

  // Enable cookie-based session store (persists on restart)
  // Please note 4KB cookie limit per domain, cookies too large will silently be ignored
  useCookieSessionStore: 'false',

  // Enable or disable built-in docs and examples.
  useDocumentation: 'true',

  // Force HTTP to redirect to HTTPS on production
  useHttps: 'true',

  // Cookie warning - update link to service's cookie page.
  cookieText: 'GOV.UK uses cookies to make the site simpler. <a href="#">Find out more about cookies</a>',

  // Enable or disable Browser Sync
  useBrowserSync: 'true',

  // These extensions will be included before others
  // This is where you can deal with extensions which conflict or rely on each other
  foundationExtensions: ['govuk-frontend'],

  // If a node_module doesn't have a config file but can be used as an extension you can write your own config here
  // if the module has an extension config included this will be ignored
  additionalExtensionConfigs: {
    'govuk-frontend': {
      nunjucksPaths: ['/', '/components'],
      scripts: ['/all.js'],
      assets: [{global: true, src: '/assets'}],
      sass: ['/all.scss']
    }
  }

}
