const { validatePluginDependency, clearErrors, getErrors, validateMeta } = require('./plugin-validator')

describe('plugin-validator', () => {
  beforeEach(() => {
    clearErrors()
  })

  describe('validatePluginDependency', () => {
    it('should be valid with a string', () => {
      validatePluginDependency('pluginDependencies', 'test-package')
      expect(getErrors()).toEqual([])
    })

    it('should be valid when an object with only the pluginName as a property', () => {
      validatePluginDependency('pluginDependencies', { packageName: 'test-package' })
      expect(getErrors()).toEqual([])
    })

    it('should be invalid when an object without the pluginName as a property', () => {
      validatePluginDependency('pluginDependencies', {})
      expect(getErrors()).toEqual([
        'In section pluginDependencies, the packageName property should exist'
      ])
    })

    it('should be invalid when an object when the pluginName is not a string', () => {
      validatePluginDependency('pluginDependencies', { packageName: null })
      expect(getErrors()).toEqual([
        'In section pluginDependencies, the packageName \'null\' should be a valid package name'
      ])
    })

    it('should be valid when an object with both the pluginName and minVersion as properties', () => {
      validatePluginDependency('pluginDependencies', { packageName: 'test-package', minVersion: '1.0.0' })
      expect(getErrors()).toEqual([])
    })

    it('should be valid when an object with both the pluginName and maxVersion as properties', () => {
      validatePluginDependency('pluginDependencies', { packageName: 'test-package', maxVersion: '2.0.0' })
      expect(getErrors()).toEqual([])
    })

    it('should be valid when an object with the pluginName, minVersion and maxVersion as properties', () => {
      validatePluginDependency('pluginDependencies', {
        packageName: 'test-package',
        minVersion: '1.0.0',
        maxVersion: '2.0.0'
      })
      expect(getErrors()).toEqual([])
    })

    it('should be invalid the minVersion or maxVersion are not strings', () => {
      validatePluginDependency('pluginDependencies', {
        packageName: 'test-package',
        minVersion: null,
        maxVersion: 100
      })
      expect(getErrors()).toEqual([
        'In section pluginDependencies, the minVersion \'null\' should be a valid version if entered',
        'In section pluginDependencies, the maxVersion \'100\' should be a valid version if entered'
      ])
    })
  })
  describe('meta', () => {
    it('should allow all the valid options', () => {
      validateMeta({
        description: 'Hello world',
        urls: {
          documentation: 'https://example.com/',
          releaseNotes: 'http://example.com/',
          versionHistory: 'https://example.com/'
        }
      })
      expect(getErrors()).toEqual([])
    })
    it('should check that urls is an object', () => {
      validateMeta({
        urls: 'abc'
      })
      expect(getErrors()).toEqual(['The meta.urls must be an object if entered'])
    })
    it('should check that urls contain a valid protocol', () => {
      validateMeta({
        urls: {
          documentation: 'ftp://example.com'
        }
      })
      expect(getErrors()).toEqual(['meta.urls.documentation doesn\'t appear to be a public URL'])
    })
    it('should fail if URL doesn\'t contain a tld', () => {
      validateMeta({
        urls: {
          releaseNotes: 'https://example'
        }
      })
      expect(getErrors()).toEqual(['meta.urls.releaseNotes doesn\'t appear to be a public URL'])
    })
    it('should fail if URL doesn\'t contain a tld but does contain a path with a dot', () => {
      validateMeta({
        urls: {
          versionHistory: 'https://example/index.html'
        }
      })
      expect(getErrors()).toEqual(['meta.urls.versionHistory doesn\'t appear to be a public URL'])
    })
    it('should fail if URL doesn\'t contain a tld but does contain a path with a dot', () => {
      validateMeta({
        urls: {
          versionHistory: 'https://example/index.html'
        }
      })
      expect(getErrors()).toEqual(['meta.urls.versionHistory doesn\'t appear to be a public URL'])
    })
    it('should fail if unknown URL provided', () => {
      validateMeta({
        urls: {
          versionHistory2: 'https://example.com/index.html'
        }
      })
      expect(getErrors()).toEqual(['The following invalid keys exist in your config: meta.urls.versionHistory2'])
    })
    it('should fail if description is not a string', () => {
      validateMeta({
        description: {}
      })
      expect(getErrors()).toEqual(['The meta.description must be a string if entered'])
    })
  })
})
