/* eslint-env jest */

const fs = require('fs')
const path = require('path')

const { appDir } = require('./path-utils')
const appConfig = path.join(appDir, 'config.js')

afterEach(() => {
  jest.restoreAllMocks()
  jest.resetModules()
})

it('exports the user app/config.js file', () => {
  const actualExistsSync = fs.existsSync
  jest.spyOn(fs, 'existsSync').mockImplementation(
    path => path === appConfig ? true : actualExistsSync(path)
  )

  jest.mock(appConfig, () => ({ serviceName: 'My Test Service' }), { virtual: true })

  expect(require('./config')).toStrictEqual({
    serviceName: 'My Test Service'
  })
})

it('exports empty object if user app/config.js does not exist', () => {
  const actualExistsSync = fs.existsSync
  jest.spyOn(fs, 'existsSync').mockImplementation(
    path => path === appConfig ? false : actualExistsSync(path)
  )

  jest.mock(appConfig, () => { throw new Error('tried to import app/config.js in test') }, { virtual: true })

  expect(require('./config')).toStrictEqual({ })
})
