/* eslint-env jest */
// NPM dependencies
jest.mock('basic-auth')
jest.mock('express/lib/response')
const basicAuth = require('basic-auth')

// Local dependencies
let authentication = require('./authentication.js')

// Local variables
const userDetails = {
  name: 'secret-username',
  pass: 'secure-password'
}
const next = jest.fn()

const res = require('express/lib/response')

// Mock console.log so we can check any output
console.error = jest.fn()

describe('authentication', () => {
  it('should be a function', () => {
    expect(authentication).toBeInstanceOf(Function)
  })

  describe('when it runs in production', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production'
      process.env.USE_AUTH = 'true'
    })

    describe('server with no username/password set', () => {
      beforeAll(() => {
        delete process.env.USERNAME
        delete process.env.PASSWORD
      })

      beforeEach(() => {
        // Jest mocks stores each call to the mocked function
        // so we want to clear them before running the authentication again.
        console.error.mockClear()
        authentication({}, res, next)
      })

      it('should return a console error', () => {
        let consoleErrorMessage = console.error.mock.calls[0][0]
        expect(consoleErrorMessage).toBe('Username or password is not set.')
      })

      it('should send marked up error message', () => {
        let errorDisplayedToUser = res.send.mock.calls[0][0]
        expect(errorDisplayedToUser).toBe('<h1>Error:</h1><p>Username or password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#6-set-a-username-and-password">See guidance for setting these</a>.</p>')
      })
    })

    describe('server with username/password set', () => {
      beforeAll(() => {
        process.env.USERNAME = 'secret-username'
        process.env.PASSWORD = 'secure-password'
      })

      describe('when a user supplies correct username/password', () => {
        beforeEach(() => {
          jest.clearAllMocks()
          basicAuth.mockReturnValue(userDetails)
          authentication({}, res, next)
        })

        it('should not return a console error', () => {
          expect(console.error).not.toBeCalled()
        })

        it('should call basic-auth and return username/password', () => {
          expect(basicAuth).toReturnWith(userDetails)
        })

        it('should not set authentication header', () => {
          expect(res.set).not.toBeCalled()
        })

        it('should not return a status', () => {
          expect(res.sendStatus).not.toBeCalled()
        })

        it('should progress to the next middleware', () => {
          expect(next).toBeCalled()
        })
      })

      describe('when a user supplies incorrect username/password', () => {
        beforeEach(() => {
          jest.clearAllMocks()
          basicAuth.mockReturnValue(undefined)
          authentication({}, res, next)
        })

        it('should not return a console error', () => {
          expect(console.error).not.toBeCalled()
        })

        it('should not send error message to the browser', () => {
          expect(res.send).not.toBeCalled()
        })

        it('should call basic-auth and return username/password', () => {
          expect(basicAuth).toReturnWith(undefined)
        })

        it('should set authentication header', () => {
          expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', 'Basic realm=Authorization Required')
        })

        it('should return 401/UnAuthorized', () => {
          expect(res.sendStatus).toHaveBeenCalledWith(401)
        })

        it('should not progress to the next middleware', () => {
          expect(next).not.toBeCalled()
        })
      })
    })
  })

  describe('when it runs in non-production enviroment (dev by default)', () => {
    beforeAll(() => {
      // Jest automatically sets NODE_ENV to 'test'
      // but we want to test when there is no NODE_ENV and it defaults
      // to development
      delete process.env.NODE_ENV
    })

    beforeEach(() => {
      jest.clearAllMocks()
      authentication({}, res, next)
    })

    it('should not call console error', () => {
      expect(console.error).not.toBeCalled()
    })

    it('should not send marked up error message', () => {
      expect(res.send).not.toBeCalled()
    })

    it('should not call basic-auth', () => {
      expect(basicAuth).not.toBeCalled()
    })

    it('should not set authentication header', () => {
      expect(res.set).not.toBeCalled()
    })

    it('should not return 401/UnAuthorized', () => {
      expect(res.sendStatus).not.toBeCalled()
    })

    it('should progress to the next middleware', () => {
      expect(next).toBeCalled()
    })
  })
})
