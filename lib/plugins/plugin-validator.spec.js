const { validatePluginDependency, clearErrors, getErrors } = require('./plugin-validator')

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
        'In section pluginDependencies, the minVersion \'null\' should be a valid version',
        'In section pluginDependencies, the maxVersion \'100\' should be a valid version if entered'
      ])
    })
  })
})
