/* eslint-env jest */

const fse = require('fs-extra')
const { validatePlugin } = require('./plugin-validator')

describe('run validator for a valid plugin', () => {
  beforeAll(async () => {
    jest.mock('fs-extra', () => {
      return {
        exists: jest.fn().mockResolvedValue(true),
        readFileSync: jest.fn().mockReturnValue('node-modules/@govuk-prototype-kit/step-by-step/govuk-prototype-kit.config.json', () => ({
          sass: [
            '/sass/_step-by-step-navigation.scss',
            '/sass/_step-by-step-navigation-header.scss',
            '/sass/_step-by-step-navigation-related.scss'
          ],
          scripts: [
            '/javascripts/step-by-step-navigation.js',
            '/javascripts/step-by-step-polyfills.js'
          ],
          templates: [
            {
              name: 'Step by step navigation page',
              path: '/templates/step-by-step-navigation.html',
              type: 'nunjucks'
            },
            {
              name: 'Start page with step by step',
              path: '/templates/start-with-step-by-step.html',
              type: 'nunjucks'
            }
          ]
        }),
        { virtual: true })
      }
    })
  })

  afterAll(async () => {
    jest.restoreAllMocks()
  })

  it('plugin with valid config should pass the validator', () => {
    const expectedErrors = []
    expect(
      validatePlugin('test-plugin')
    ).toEqual(expectedErrors)
  })
})

describe('run validator for an invalid plugin', () => {
  beforeAll(async () => {
    jest.mock('fs-extra', () => {
      return {
        exists: jest.fn().mockResolvedValue(true),
        existsSync: jest.fn().mockResolvedValue(true),
        readFileSync: jest.fn().mockReturnValue('node-modules/@govuk-prototype-kit/step-by-step/govuk-prototype-kit.config.json', () => ({
          scss: [
            '/sass/_step-by-step-navigation.scss',
            '/sass/_step-by-step-navigation-header.scss',
            '/sass/_step-by-step-navigation-related.scss'
          ],
          scripts: [
            'javascripts/step-by-step-navigation.js',
            'javascripts/step-by-step-polyfills.js'
          ],
          templates: [
            {
              name: 'Step by step navigation page',
              path: '/templates/step-by-step-navigation.html',
              type: 'nunjucks'
            },
            {
              name: 'Start page with step by step',
              path: '/templates/start-with-step-by-step.html',
              type: 'nunjucks'
            }
          ]
        }),
        { virtual: true })
      }
    })
  })

  it('plugin config with unknown settings should fail', () => {
    const expectedErrors = []
    expect(
      validatePlugin('test-plugin')
    ).toEqual(expectedErrors)
  })

  it('plugin config with invalid path names should fail', () => {
  })

  it('plugin config with nonexistent paths should fail', () => {
  })
})
