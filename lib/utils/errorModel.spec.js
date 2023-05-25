/* eslint-env jest */

// local dependencies
const { getErrorDetails } = require('./errorModel')

describe('getErrorDetails', () => {
  it('should return undefined when the error isn\'t processable', () => {
    expect(getErrorDetails({})).toBe(undefined)
  })
  it('should process a standard Node error', () => {
    expect(getErrorDetails({
      message: 'Example error',
      stack: [
        'Error: Example error',
        '    at Object.<anonymous> (/Users/example.user/opensource/alphagov/govuk-prototype-kit/playground.js:5:9)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)',
        '    at node:internal/main/run_main_module:23:47'].join('\n')
    })).toBe({
      column: 9,
      filePath: '/Users/example.user/opensource/alphagov/govuk-prototype-kit/playground.js',
      line: '5',
      message: 'Example error'
    })
  })
})
