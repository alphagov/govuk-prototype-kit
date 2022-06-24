/* eslint-env jest */
// NPM dependencies
const url = require('url')

// Local dependencies
const authentication = require('./authentication')
const config = require('../../../app/config')

// Local variables
const userPassword = 'secure-password'
const encryptedUserPassword = '3885c3c07cfdd4bc7d08ded0f4e39b7300b2ae872d18e3c8c192926c9d6e6636'
const next = jest.fn()

const res = require('express/lib/response')

const examplePath = url.format({
  pathname: '/abc/def'
})
const exampleQuery = {
  ghi: 'jkl',
  mno: 'pqr'
}
const unauthenticatedCookie = {}
const authenticatedCookie = {
  authentication: encryptedUserPassword
}

const originalEnvironmentVariables = process.env

// Mock console.log so we can check any output
console.error = jest.fn()

jest.mock('express/lib/response')
jest.mock('../../../app/config')

describe('authentication', () => {
  beforeEach(function () {
    process.env = {}
    jest.clearAllMocks()
  })
  afterEach(function () {
    process.env = originalEnvironmentVariables
  })
  const assume = expect
  it('should be a function', () => {
    expect(authentication).toBeInstanceOf(Function)
  })

  it('returns a middleware function', () => {
    expect(authentication()).toBeInstanceOf(Function)
  })

  describe('when it runs in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
      process.env.USE_AUTH = 'true'
    })

    describe('server with no password set', () => {
      beforeEach(() => {
        delete process.env.PASSWORD
        // Jest mocks stores each call to the mocked function
        // so we want to clear them before running the authentication again.
        console.error.mockClear()
        authentication()({ path: examplePath }, res, next)
      })

      it('should return a console error', () => {
        const consoleErrorMessage = console.error.mock.calls[0][0]
        expect(consoleErrorMessage).toBe('Password is not set.')
      })

      it('should return a user friendly error to the browser', () => {
        const errorDisplayedToUser = res.send.mock.calls[0][0]
        expect(errorDisplayedToUser).toBe('<h1>Error:</h1><p>Password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#6-set-a-password">See guidance for setting a password</a>.</p>')
      })
    })

    describe('server with password set', () => {
      beforeEach(() => {
        process.env.PASSWORD = userPassword
      })

      describe('when a user is not authenticated', () => {
        function callMiddleware () {
          authentication()({
            path: examplePath,
            query: exampleQuery,
            cookies: unauthenticatedCookie
          }, res, next)
        }

        it('should redirect to password page when USE_AUTH is lowercase true', () => {
          process.env.USE_AUTH = 'true'

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when USE_AUTH is uppercase TRUE', () => {
          process.env.USE_AUTH = 'TRUE'

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when NODE_ENV is uppercase PRODUCTION', () => {
          process.env.NODE_ENV = 'PRODUCTION'

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when NODE_ENV is lowercase production', () => {
          process.env.NODE_ENV = 'production'

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when hosted on Glitch', () => {
          process.env.PROJECT_REMIX_CHAIN = 'lasdkflkdsjf (any value here)'
          delete process.env.NODE_ENV

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when config.js has useAuth="true"', () => {
          delete process.env.USE_AUTH

          config.useAuth = 'true'

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when USE_AUTH="true" even if config.js has useAuth="false"', () => {
          process.env.USE_AUTH = 'true'
          config.useAuth = 'false'

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/prototype-admin/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should not redirect to password page when USE_AUTH="false" even if config.js has useAuth="true"', () => {
          process.env.USE_AUTH = 'false'
          config.useAuth = 'true'

          callMiddleware()

          expect(res.redirect).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
        })
        it('should not be able to load assets', () => {
          authentication()({
            path: '/public/stylesheets/unbranded2.css',
            cookies: unauthenticatedCookie
          }, res, next)

          expect(res.redirect).toHaveBeenCalledWith('/prototype-admin/password?returnURL=%2Fpublic%2Fstylesheets%2Funbranded2.css')
          expect(next).not.toHaveBeenCalled()
        })
        it('should be able to load styles for password page', () => {
          authentication()({
            path: '/public/stylesheets/unbranded.css',
            cookies: unauthenticatedCookie
          }, res, next)

          assume(res.redirect).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
        })
      })

      describe('when a user is authenticated', () => {
        beforeEach(() => {
          authentication()({
            path: examplePath,
            query: exampleQuery,
            cookies: authenticatedCookie
          }, res, next)
        })

        it('should not redirect to the password page', () => {
          expect(res.redirect).not.toBeCalled()
        })

        it('should not return a console error', () => {
          expect(console.error).not.toBeCalled()
        })

        it('should not set authentication header', () => {
          expect(res.set).not.toBeCalled()
        })

        it('should progress to the next middleware', () => {
          expect(next).toBeCalled()
        })
      })
    })
  })

  describe('when it runs in non-production environment (dev by default)', () => {
    beforeEach(() => {
      authentication()({
        path: examplePath,
        query: exampleQuery
      }, res, next)
    })

    it('should not call console error', () => {
      expect(console.error).not.toBeCalled()
    })

    it('should not send marked up error message', () => {
      expect(res.send).not.toBeCalled()
    })

    it('should progress to the next middleware', () => {
      expect(next).toBeCalled()
    })
  })

  describe('authentication is off', () => {
    function callMiddleware () {
      authentication()({
        path: examplePath,
        query: exampleQuery
      }, res, next)
    }

    it('should progress to the next middleware', () => {
      process.env.NODE_ENV = 'production'
      process.env.USE_AUTH = 'false'

      callMiddleware()

      assume(console.error).not.toBeCalled()
      assume(res.send).not.toBeCalled()
      expect(next).toBeCalled()
    })

    it('should progress to the next middleware', () => {
      process.env.NODE_ENV = 'production'
      process.env.USE_AUTH = 'FALSE'

      callMiddleware()

      assume(console.error).not.toBeCalled()
      assume(res.send).not.toBeCalled()
      expect(next).toBeCalled()
    })
    it('should redirect to password page when config says useAuth="false"', () => {
      process.env.NODE_ENV = 'production'
      delete process.env.USE_AUTH

      config.useAuth = 'false'

      callMiddleware()

      assume(console.error).not.toBeCalled()
      assume(res.send).not.toBeCalled()
      expect(next).toBeCalled()
    })
  })
})
