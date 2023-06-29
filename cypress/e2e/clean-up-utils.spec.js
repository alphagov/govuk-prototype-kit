/* The following are some unit tests to make sure the clean-up-utils */
/* functions work as they should within the cypress tests.           */

const CleanUpUtils = require('./clean-up-utils')

describe('clean-up-utils', () => {
  let cleanUp

  beforeEach(() => {
    cleanUp = new CleanUpUtils()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Push and execute restore functions successfully', async () => {
    const restoreFn1 = jest.fn().mockResolvedValue(null)
    const restoreFn2 = jest.fn().mockResolvedValue(null)
    const restoreFn3 = jest.fn().mockResolvedValue(null)

    cleanUp.addRestoreFunction(restoreFn1)
    cleanUp.addRestoreFunction(restoreFn2)
    cleanUp.addRestoreFunction(restoreFn3)

    await cleanUp.restore()

    expect(restoreFn1).toBeCalledTimes(1)
    expect(restoreFn2).toBeCalledTimes(1)
    expect(restoreFn3).toBeCalledTimes(1)
  })
})
