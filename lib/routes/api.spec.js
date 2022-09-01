/* eslint-env jest */

const routers = require('./api')
const fakeValues = {
  router: {}
}

jest.mock('express', () => {
  return { Router: jest.fn(() => fakeValues.router) }
})

describe('routes API', () => {
  afterEach(() => {
    routers.resetState()
  })
  it('should return a router', () => {
    const fakeRouter = {}

    const router = routers.external.setupRouter()

    expect(router).toEqual(fakeRouter)
  })
  it('should set the router up with the app', () => {
    const fakeRouter = {}
    const fakeApp = { use: jest.fn() }

    routers.setApp(fakeApp)
    routers.external.setupRouter()

    expect(fakeApp.use).toHaveBeenCalledWith('/', fakeRouter)
  })
  it('should set the router up with the app even if the app is included after the router is created', () => {
    const fakeRouter = {}
    const fakeApp = { use: jest.fn() }

    routers.external.setupRouter()
    routers.setApp(fakeApp)

    expect(fakeApp.use).toHaveBeenCalledWith('/', fakeRouter)
  })
  it('should allow the user to set the path of the router', () => {
    const fakeRouter = {}
    const fakeApp = { use: jest.fn() }

    routers.setApp(fakeApp)
    routers.external.setupRouter('/my-path')

    expect(fakeApp.use).toHaveBeenCalledWith('/my-path', fakeRouter)
  })
  it('should allow the user to set the path of the router when the app is included after the router', () => {
    const fakeRouter = {}
    const fakeApp = { use: jest.fn() }

    routers.external.setupRouter('/my-path')
    routers.setApp(fakeApp)

    expect(fakeApp.use).toHaveBeenCalledWith('/my-path', fakeRouter)
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
})
