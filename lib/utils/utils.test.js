/* eslint-env jest */

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('sessionFileStoreQuietLogFn', () => {
  it('hides messages about deleting expired sessions', () => {
    jest.spyOn(global.console, 'log').mockImplementation()

    const session = require('express-session')
    const SessionFileStore = require('session-file-store')(session)
    const { sessionFileStoreQuietLogFn } = require('./index')

    jest.useFakeTimers({ doNotFake: ['performance'] })

    const testStore = new SessionFileStore({
      logFn: sessionFileStoreQuietLogFn,
      reapInterval: 0.01
    })

    jest.runOnlyPendingTimers()

    clearTimeout(testStore.options.reapIntervalObject)

    expect(console.log).not.toHaveBeenCalled()
  })
})
