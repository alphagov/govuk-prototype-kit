const { askForUsageDataPermission } = require('./usage-data')

jest.mock('@inquirer/confirm')

const { default: confirm } = require('@inquirer/confirm')

describe('askForUsageDataPermission', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when in an interactive shell', () => {
    beforeEach(() => {
      jest.replaceProperty(process.stdout, 'isTTY', true)
    })

    it('asks the user for confirmation', () => {
      askForUsageDataPermission()

      expect(confirm).toHaveBeenCalledTimes(1)
      expect(confirm).toHaveBeenCalledWith({
        default: false,
        message: expect.stringContaining(
          'Do you give permission for the kit to send anonymous usage data?'
        )
      })
    })

    it('returns true if the user accepts tracking', async () => {
      confirm.mockResolvedValue(true)

      expect(await askForUsageDataPermission()).toBe(true)
    })

    it('returns false if the user does not accept tracking', async () => {
      confirm.mockResolvedValue(false)

      expect(await askForUsageDataPermission()).toBe(false)
    })
  })

  describe('when in a non-interactive shell', () => {
    beforeEach(() => {
      jest.replaceProperty(process.stdout, 'isTTY', false)
    })

    it('does not ask the user for confirmation', () => {
      askForUsageDataPermission()

      expect(confirm).not.toHaveBeenCalled()
    })

    it('returns false', async () => {
      expect(await askForUsageDataPermission()).toBe(false)
    })
  })
})
