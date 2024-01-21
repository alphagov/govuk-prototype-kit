/* eslint-env jest */

// local dependencies
const { getProxyPluginConfig } = require('./plugin-utils')
const { mockFileSystem } = require('../../__tests__/utils/mock-file-system')
const { projectDir } = require('../utils/paths')

const testPluginConfig = {
  scripts: './dist/test-script.js'
}

describe('getProxyPluginConfig', () => {
  let testScope

  beforeEach(() => {
    testScope = {
      fileSystem: mockFileSystem(projectDir)
    }
    testScope.fileSystem.setupSpies()
    testScope.fileSystem.createDirectory(['app'])
    testScope.fileSystem.writeFile(['app', 'plugin-proxy.json'], JSON.stringify({
      'test-plugin-config': testPluginConfig
    }))
  })

  afterEach(() => {
    testScope.fileSystem.teardown()
  })

  it('get jquery proxy plugin config', () => {
    const pluginConfig = getProxyPluginConfig('jquery')
    expect(Object.keys(pluginConfig)).toEqual(['scripts', 'assets', 'meta'])
  })

  it('get test script proxy plugin config', () => {
    const pluginConfig = getProxyPluginConfig('test-plugin-config')
    expect(pluginConfig).toEqual(testPluginConfig)
  })
})
