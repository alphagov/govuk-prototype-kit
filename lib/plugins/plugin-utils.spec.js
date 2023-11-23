/* eslint-env jest */

// npm dependencies
const fs = require('fs')

// local dependencies
const { getProxyPluginConfig } = require('./plugin-utils')

const testPluginConfig = {
  scripts: './dist/test-script.js'
}
jest.mock('fs-extra', () => {
  return {
    existsSync: jest.fn().mockReturnValue(true)
  }
})

describe('getProxyPluginConfig', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      return JSON.stringify({
        'test-plugin-config': testPluginConfig
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
