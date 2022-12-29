/* eslint-env jest */

// npm dependencies
const express = require('express')

// local dependencies
const routers = require('./api')

const fakeValues = {
  router: { use: () => {} },
  static: {}
}

jest.mock('express', () => {
  return {
    Router: jest.fn(() => fakeValues.router),
    static: jest.fn(() => fakeValues.static)
  }
})

describe('routes API', () => {
  afterEach(() => {
    routers.resetState()
  })
  it('should return a router', () => {
    const router = routers.external.setupRouter()

    expect(router).toBe(fakeValues.router)
  })
  it('should set the router up with the app', () => {
    const fakeApp = { use: jest.fn() }

    routers.setApp(fakeApp)
    routers.external.setupRouter()

    expect(fakeApp.use).toHaveBeenCalledWith('/', fakeValues.router)
  })
  it('should set the router up with the app even if the app is included after the router is created', () => {
    const fakeApp = { use: jest.fn() }

    routers.external.setupRouter()
    routers.setApp(fakeApp)

    expect(fakeApp.use).toHaveBeenCalledWith('/', fakeValues.router)
  })
  it('should allow the user to set the path of the router', () => {
    const fakeApp = { use: jest.fn() }

    routers.setApp(fakeApp)
    routers.external.setupRouter('/my-path')

    expect(fakeApp.use).toHaveBeenCalledWith('/my-path', fakeValues.router)
  })
  it('should allow the user to set the path of the router when the app is included after the router', () => {
    const fakeApp = { use: jest.fn() }

    routers.external.setupRouter('/my-path')
    routers.setApp(fakeApp)

    expect(fakeApp.use).toHaveBeenCalledWith('/my-path', fakeValues.router)
  })
  it('should error if anything other than a string is provided for the path', () => {
    const expectedError = new Error('setupRouter cannot be provided with a router, it sets up a router and returns it to you.')
    expect(() => {
      routers.external.setupRouter(() => {})
    }).toThrow(expectedError)

    expect(() => {
      routers.external.setupRouter({})
    }).toThrow(expectedError)
  })
  it('should set up a static router', () => {
    const fakeApp = { use: jest.fn() }

    routers.setApp(fakeApp)
    routers.external.serveDirectory('/abc', '/tmp/abcd')

    expect(fakeApp.use).toHaveBeenCalledWith('/abc', fakeValues.static)
    expect(express.static).toHaveBeenCalledWith('/tmp/abcd')
  })
  it('should set up a static router when app is set after', () => {
    const fakeApp = { use: jest.fn() }

    routers.external.serveDirectory('/abc', '/tmp/efgh')
    routers.setApp(fakeApp)

    expect(fakeApp.use).toHaveBeenCalledWith('/abc', fakeValues.static)
    expect(express.static).toHaveBeenCalledWith('/tmp/efgh')
  })
})
