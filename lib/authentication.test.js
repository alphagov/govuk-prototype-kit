/* eslint-env jest */

// npm dependencies
const res = require('express/lib/response')
const url = require('url')

// local dependencies
const authentication = require('./authentication')
const config = require('./config')

// Local variables
const userPassword = 'secure-password'
const encryptedUserPassword = '3885c3c07cfdd4bc7d08ded0f4e39b7300b2ae872d18e3c8c192926c9d6e6636'
const next = jest.fn()

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

jest.mock('express/lib/response')

describe('authentication', () => {
  let testScope
  beforeEach(() => {
    res.redirect.mockClear()
    res.send.mockClear()
    testScope = {
      appConfig: {
        useAuth: true
      }
    }
    console.error = jest.fn()
    jest.spyOn(config, 'getConfig').mockImplementation(() => {
      return testScope.appConfig
    })
  })
  afterEach(() => {
    jest.restoreAllMocks()
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
      testScope.appConfig.isProduction = true
      testScope.appConfig.useAuth = true
    })

    describe('server with no password set', () => {
      beforeEach(() => {
        delete testScope.appConfig.passwords
        // Jest mocks stores each call to the mocked function
        // so we want to clear them before running the authentication again.
        console.error.mockClear()
        authentication()({ path: examplePath }, res, next)
      })

      it('should return a console error', () => {
        expect(console.error).toHaveBeenCalledWith('Password is not set.')
        const consoleErrorMessage = console.error.mock.calls[0][0]
        expect(consoleErrorMessage).toBe('Password is not set.')
      })

      it('should return a user friendly error to the browser', () => {
        const errorDisplayedToUser = res.send.mock.calls[0][0]
        expect(errorDisplayedToUser).toBe('<h1>Error:</h1><p>Password not set. <a href="https://prototype-kit.service.gov.uk/docs/publishing#setting-a-password">See guidance for setting a password</a>.</p>')
      })
    })

    describe('server with password set', () => {
      beforeEach(() => {
        testScope.appConfig.passwords = [userPassword]
      })

      describe('when a user is not authenticated', () => {
        const callMiddleware = () => {
          authentication()({
            path: examplePath,
            query: exampleQuery,
            cookies: unauthenticatedCookie
          }, res, next)
        }

        it('should redirect to password page when USE_AUTH is lowercase true', () => {
          testScope.appConfig.useAuth = true

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/manage-prototype/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when USE_AUTH is uppercase TRUE', () => {
          testScope.appConfig.useAuth = true

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/manage-prototype/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when NODE_ENV is uppercase PRODUCTION', () => {
          testScope.appConfig.isProduction = true

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/manage-prototype/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when NODE_ENV is lowercase production', () => {
          testScope.appConfig.isProduction = true

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/manage-prototype/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when config.js has useAuth="true"', () => {
          testScope.appConfig.useAuth = true

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/manage-prototype/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should redirect to password page when USE_AUTH="true" even if config.js has useAuth="false"', () => {
          testScope.appConfig.useAuth = true

          callMiddleware()

          expect(res.redirect).toHaveBeenCalledWith(
            '/manage-prototype/password?returnURL=%2Fabc%2Fdef%3Fghi%3Djkl%26mno%3Dpqr')
        })
        it('should not be able to load assets', () => {
          authentication()({
            path: '/public/stylesheets/unbranded2.css',
            cookies: unauthenticatedCookie
          }, res, next)

          expect(res.redirect).toHaveBeenCalledWith('/manage-prototype/password?returnURL=%2Fpublic%2Fstylesheets%2Funbranded2.css')
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
    const callMiddleware = () => {
      authentication()({
        path: examplePath,
        query: exampleQuery
      }, res, next)
    }

    it('should progress to the next middleware', () => {
      testScope.appConfig.isProduction = true
      testScope.appConfig.useAuth = false

      callMiddleware()

      assume(console.error).not.toBeCalled()
      assume(res.send).not.toBeCalled()
      expect(next).toBeCalled()
    })
    it('should redirect to password page when config says useAuth="false"', () => {
      testScope.appConfig.isProduction = true
      testScope.appConfig.useAuth = false

      callMiddleware()

      assume(console.error).not.toBeCalled()
      assume(res.send).not.toBeCalled()
      expect(next).toBeCalled()
    })
  })
})
