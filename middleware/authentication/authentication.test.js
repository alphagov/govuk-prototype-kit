/* eslint-env jest */
// NPM dependencies
jest.mock('basic-auth')
const basicAuth = require('basic-auth')

// Local dependencies
const authentication = require('./authentication.js')

// Local variables
const userDetails = { name: 'secret-username', password: 'secure-password' }
const next = jest.fn()
const res = {send: jest.fn(),
  set: jest.fn(),
  sendStatus: jest.fn()
}

// Mock console.log so we can check any output
console.log = jest.fn()

describe('authentication', () => {
  it('should be a function', () => {
    expect(authentication).toBeInstanceOf(Function)
  })

  describe('misconfigured server', () => {
    beforeEach(() => {
      console.log.mockClear()
      let middleware = authentication(undefined, undefined)
      middleware({}, res, next)
    })

    it('should return a console log with an error', () => {
      expect(console.log.mock.calls[0][0]).toBe('Username or password is not set.')
    })

    it('should send marked up error message', () => {
      expect(res.send.mock.calls[0][0]).toBe('<h1>Error:</h1><p>Username or password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#6-set-a-username-and-password">See guidance for setting these</a>.</p>')
    })
  })

  describe('server with username/password set', () => {
    beforeEach(() => {
      console.log.mockClear()
      let middleware = authentication('secret-username', 'secure-password')
      middleware({}, res, next)
      basicAuth.mockReturnValue(userDetails)
    })

    it('should not console log', () => {
      expect(console.log).not.toBeCalled()
    })

    it('should call basic-auth and return username/password', () => {
      expect(basicAuth).toReturnWith(userDetails)
    })
  })
})
