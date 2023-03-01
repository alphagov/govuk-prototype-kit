/**
 * @jest-environment jsdom
 */

async function fetchResponse (data) {
  return {
    json: async () => data
  }
}

const loadedHTML = `
      <div>
        <div id="panel-manual-instructions"></div>
        <div id="panel-processing" hidden=""></div>
        <div id="panel-complete" hidden=""></div>
        <div id="panel-error" hidden=""></div>
        <div id="instructions-complete" hidden=""></div>
      </div>
    `

const processingHTML = `
      <div>
        <div id="panel-manual-instructions" hidden=""></div>
        <div id="panel-processing"></div>
        <div id="panel-complete" hidden=""></div>
        <div id="panel-error" hidden=""></div>
        <div id="instructions-complete" hidden=""></div>
      </div>
    `

const completedHTML = `
      <div>
        <div id="panel-manual-instructions" hidden=""></div>
        <div id="panel-processing" hidden=""></div>
        <div id="panel-complete"></div>
        <div id="panel-error" hidden=""></div>
        <div id="instructions-complete"></div>
      </div>
    `

const errorHTML = `
      <div>
        <div id="panel-manual-instructions" hidden=""></div>
        <div id="panel-processing" hidden=""></div>
        <div id="panel-complete" hidden=""></div>
        <div id="panel-error"></div>
        <div id="instructions-complete" hidden=""></div>
      </div>
    `

describe('manage-plugins', () => {
  global.fetch = jest.fn().mockResolvedValue(null)

  const performActionUrl = '/manage-prototype/plugins/'
  const pollStatusUrl = '/manage-prototype/plugins//status'

  const { document, window } = global
  let managePlugins
  let fetchList

  const mockFetch = (statuses) => {
    let responseIndex = 0
    const responses = statuses.map((status) => (url) => {
      fetchList.push(url)
      if (status === 'throws') {
        return Promise.reject(new Error('The server is restarting'))
      }
      return fetchResponse({ status })
    })
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      return responses[responseIndex++](url)
    })
  }

  beforeAll(() => {
    window.GOVUKPrototypeKit = {
      internal: {}
    }

    require('./manage-plugins')

    managePlugins = window.GOVUKPrototypeKit.internal.managePlugins
  })

  beforeEach(() => {
    jest.spyOn(window, 'setTimeout').mockImplementation((fn, timeout) => {
      // Only execute fn when the timeout is one-second.
      // This is how I identify timeout in the makeRequest function
      if (timeout === 1000) {
        process.nextTick(fn)
        return 'request-timeout-id'
      }
      return 'action-timeout-id'
    })
    document.head.innerHTML = '<meta content="authenticity_token" name="csrf-token" />'
    document.body.innerHTML = loadedHTML
    fetchList = []
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('showCompleteStatus', () => {
    document.body.innerHTML = processingHTML
    managePlugins.showCompleteStatus()
    expect(document.body.innerHTML).toEqual(completedHTML)
  })

  it('showErrorStatus', () => {
    document.body.innerHTML = processingHTML
    managePlugins.showErrorStatus()
    expect(document.body.innerHTML).toEqual(errorHTML)
  })

  describe('performAction', () => {
    beforeEach(() => {
      document.body.innerHTML = processingHTML
    })

    it('completed', async () => {
      mockFetch(['completed'])

      await managePlugins.performAction()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(fetchList).toEqual([performActionUrl])
    })

    it('error', async () => {
      mockFetch(['error'])

      await managePlugins.performAction()

      expect(document.body.innerHTML).toEqual(errorHTML)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(fetchList).toEqual([performActionUrl])
    })

    it('will restart', async () => {
      mockFetch(['throws', 'processing', 'completed'])

      await managePlugins.performAction()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(fetchList).toEqual([performActionUrl, performActionUrl, pollStatusUrl])
    })
  })

  describe('pollStatus', () => {
    beforeEach(() => {
      document.body.innerHTML = processingHTML
    })

    it('completed', async () => {
      mockFetch([
        'processing',
        'throws',
        'completed'
      ])

      await managePlugins.pollStatus()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(fetchList).toEqual([pollStatusUrl, pollStatusUrl, pollStatusUrl])
    })

    it('error', async () => {
      mockFetch([
        'processing',
        'throws',
        'error'
      ])

      await managePlugins.pollStatus()

      expect(document.body.innerHTML).toEqual(errorHTML)
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(fetchList).toEqual([pollStatusUrl, pollStatusUrl, pollStatusUrl])
    })
  })

  describe('init', () => {
    beforeEach(() => {
      document.body.innerHTML = loadedHTML
    })

    it('completed', async () => {
      mockFetch([
        'processing',
        'processing',
        'throws',
        'completed'
      ])

      await managePlugins.init()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(4)
      expect(fetchList).toEqual([performActionUrl, pollStatusUrl, pollStatusUrl, pollStatusUrl])
    })

    it('error', async () => {
      mockFetch([
        'processing',
        'processing',
        'throws',
        'error'
      ])

      await managePlugins.init()

      expect(document.body.innerHTML).toEqual(errorHTML)
      expect(global.fetch).toHaveBeenCalledTimes(4)
      expect(fetchList).toEqual([performActionUrl, pollStatusUrl, pollStatusUrl, pollStatusUrl])
    })
  })
})
