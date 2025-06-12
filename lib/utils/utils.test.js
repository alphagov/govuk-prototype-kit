/* eslint-env jest */

const { sessionFileStoreQuietLogFn, hasNewVersion } = require('./index')
afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('sessionFileStoreQuietLogFn', () => {
  it('hides messages about deleting expired sessions', () => {
    jest.spyOn(global.console, 'log').mockImplementation()

    const SessionFileStore = require('../session-file-store')

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

describe('hasNewVersion', () => {
  [
    { installed: '13.1.0', latest: undefined, result: false },
    { installed: '13.1.0', latest: '13.1.0', result: false },
    { installed: '13.1.1', latest: '13.1.0', result: false },
    { installed: '13.2.0', latest: '13.1.0', result: false },
    { installed: '14.1.0', latest: '13.1.0', result: false },
    { installed: '13.1.0', latest: '13.1.1', result: true },
    { installed: '13.1.0', latest: '13.2.0', result: true },
    { installed: '13.1.0', latest: '14.1.0', result: true },
    { installed: '13.2.4-rc1', latest: '13.2.4-rc1', result: false },
    { installed: '13.2.3-rc1', latest: '13.2.4-rc1', result: true },
    { installed: '13.2.4-rc1', latest: '13.2.4-rc2', result: true },
    { installed: '13.2.4-rc1', latest: '13.2.4', result: true },
    { installed: '13.2.4', latest: '13.2.4-rc1', result: false },
    { installed: '5.0.0-internal.0', latest: '4.7.0', result: false },
    { installed: '4.7.0', latest: '5.0.0-internal.0', result: true },
    { installed: '4.7.0-internal.0', latest: '5.0.0', result: true },
    { installed: '5.0.0', latest: '4.7.0-internal.0', result: false },
    { installed: '1.0.9', latest: '1.0.10', result: true },
    { installed: '1.9.0', latest: '1.10.0', result: true },
    { installed: '9.0.0', latest: '10.0.0', result: true },
    { installed: 'nonsense', latest: 'not.a.version.number', result: false }
  ].forEach(({
    installed,
    latest,
    result
  }) => it(`should return ${result} when installed version is ${installed} and latest version is ${latest}`, () => {
    expect(hasNewVersion(installed, latest)).toEqual(result)
  }))
})
