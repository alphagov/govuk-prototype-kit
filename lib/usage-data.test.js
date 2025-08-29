const { askForUsageDataPermission } = require('./usage-data')

jest.mock('@inquirer/confirm')

const { default: confirm } = require('@inquirer/confirm')

describe('askForUsageDataPermission', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when in an interactive shell', () => {
    // We can't use jest.replaceProperty here because in a non-TTY environment
    // the isTTY property doesn't exist on process.stdout, and Jest will only
    // replace existing properties.
    let originalTTY

    beforeAll(() => {
      originalTTY = process.stdout.isTTY
      process.stdout.isTTY = true
    })

    afterAll(() => {
      process.stdout.isTTY = originalTTY
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
    // We can't use jest.replaceProperty here because in a non-TTY environment
    // the isTTY property doesn't exist on process.stdout, and Jest will only
    // replace existing properties.
    let originalTTY

    beforeAll(() => {
      originalTTY = process.stdout.isTTY
      process.stdout.isTTY = undefined
    })

    afterAll(() => {
      process.stdout.isTTY = originalTTY
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
