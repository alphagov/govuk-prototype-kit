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
        <div id="dependency-heading"></div>
        <div id="plugin-heading" hidden=""></div>
        <div id="panel-manual-instructions"></div>
        <div id="panel-processing" hidden=""></div>
        <div id="panel-complete" hidden=""></div>
        <div id="panel-error" hidden=""></div>
        <div id="instructions-complete" hidden=""></div>
      </div>
    `

const processingHTML = `
      <div>
        <div id="dependency-heading" hidden=""></div>
        <div id="plugin-heading"></div>
        <div id="panel-manual-instructions" hidden=""></div>
        <div id="panel-processing"></div>
        <div id="panel-complete" hidden=""></div>
        <div id="panel-error" hidden=""></div>
        <div id="instructions-complete" hidden=""></div>
      </div>
    `

const completedHTML = `
      <div>
        <div id="dependency-heading" hidden=""></div>
        <div id="plugin-heading"></div>
        <div id="panel-manual-instructions" hidden=""></div>
        <div id="panel-processing" hidden=""></div>
        <div id="panel-complete"></div>
        <div id="panel-error" hidden=""></div>
        <div id="instructions-complete"></div>
      </div>
    `

const errorHTML = `
      <div>
        <div id="dependency-heading" hidden=""></div>
        <div id="plugin-heading"></div>
        <div id="panel-manual-instructions" hidden=""></div>
        <div id="panel-processing" hidden=""></div>
        <div id="panel-complete" hidden=""></div>
        <div id="panel-error"></div>
        <div id="instructions-complete" hidden=""></div>
      </div>
    `

const token = 'csrf-test-token'

describe('manage-plugins', () => {
  global.fetch = jest.fn().mockResolvedValue(null)

  const getTokenUrl = '/manage-prototype/csrf-token'
  const statusUrl = '/hello/world'
  const selfUrl = 'http://localhost/'

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
      return fetchResponse(status)
    })
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      const index = responseIndex++
      const fn = responses[index]
      if (!fn) {
        throw new Error(`More responses than expected, ${responses.length} configured, ${index + 1} called
        
        Calls were [${fetchList.join(', ')}]
        
        Failing call was [${url}]
        `)
      }
      return fn(url)
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
      mockFetch([
        { status: { token } },
        { statusUrl },
        { status: 'completed' }
      ])

      await managePlugins.performAction()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        getTokenUrl,
        selfUrl,
        statusUrl
      ])
    })

    it('error', async () => {
      mockFetch([
        { status: token },
        { statusUrl },
        { status: 'error' }
      ])

      await managePlugins.performAction()

      expect(document.body.innerHTML).toEqual(errorHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        getTokenUrl,
        selfUrl,
        statusUrl
      ])
    })

    it('will restart', async () => {
      mockFetch([
        { status: { token } },
        { statusUrl },
        { status: 'throws' },
        { status: { token } },
        { statusUrl },
        { status: 'processing' },
        { status: 'completed' }]
      )

      await managePlugins.performAction()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        getTokenUrl,
        selfUrl,
        statusUrl,
        statusUrl,
        statusUrl,
        statusUrl,
        statusUrl
      ])
    })
  })

  describe('pollStatus', () => {
    beforeEach(() => {
      document.body.innerHTML = processingHTML
    })

    it('completed', async () => {
      mockFetch([
        { status: 'processing' },
        { status: 'throws' },
        { status: 'completed' }
      ])

      await managePlugins.pollStatus(statusUrl)

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        statusUrl,
        statusUrl,
        statusUrl
      ])
    })

    it('error', async () => {
      mockFetch([
        { status: 'processing' },
        { status: 'throws' },
        { status: 'error' }
      ])

      await managePlugins.pollStatus(statusUrl)

      expect(document.body.innerHTML).toEqual(errorHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        statusUrl,
        statusUrl,
        statusUrl
      ])
    })
  })

  describe('init', () => {
    beforeEach(() => {
      document.body.innerHTML = loadedHTML
    })

    it('completed', async () => {
      mockFetch([
        { status: { token } },
        { statusUrl },
        { status: 'processing' },
        { status: 'processing' },
        { status: 'throws' },
        { status: 'completed' }
      ])

      await managePlugins.init()

      expect(document.body.innerHTML).toEqual(completedHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        getTokenUrl,
        selfUrl,
        statusUrl,
        statusUrl,
        statusUrl,
        statusUrl
      ])
    })

    it('error', async () => {
      mockFetch([
        { status: { token } },
        { statusUrl },
        { status: 'processing' },
        { status: 'processing' },
        { status: 'throws' },
        { status: 'error' }
      ])

      await managePlugins.init()

      expect(document.body.innerHTML).toEqual(errorHTML)
      expect(global.fetch).toHaveBeenCalledTimes(fetchList.length)
      expect(fetchList).toEqual([
        getTokenUrl,
        selfUrl,
        statusUrl,
        statusUrl,
        statusUrl,
        statusUrl
      ])
    })
  })
})
