/**
 * @jest-environment jsdom
 */

jest.useFakeTimers()

Object.defineProperty(window, 'GOVUKPrototypeKit', {
  value: { documentReady: (fn) => fn() }
})

async function fetchResponse (data) {
  return {
    json: async () => data
  }
}

describe('manage-plugins', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta content="authenticity_token" name="csrf-token"></meta>
    `
    document.body.innerHTML = `
      <div>
        <div id="panel-manual-instructions"></div>
        <div id="panel-processing"></div>
        <div id="panel-error"></div>
      </div>
    `
  })

  it('install plugin successfully', () => {
    let fetchIndex = 0

    global.fetch = jest.fn().mockImplementation((url, config) => {
      console.log(`fetch ${url}`, config)
      switch (fetchIndex) {
        case 0:
          fetchIndex++
          return fetchResponse({ status: 'processing' })
        case 1:
          fetchIndex++
          return fetchResponse({ status: 'processing' })
        case 2:
          fetchIndex++
          return Promise.reject(new Error())
        case 3:
          fetchIndex++
          return fetchResponse({ status: 'completed' })
      }
    })

    require('./manage-plugins')
  })
})
