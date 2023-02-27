/* eslint-env jest */

// local dependencies
const api = require('./api')

describe('Globals', () => {
  afterEach(() => {
    api.setEnvironment(undefined)
    jest.clearAllMocks()
  })

  it('Should add globals to the environment', () => {
    const env = { addGlobal: jest.fn() }
    const fn = () => {}

    api.setEnvironment(env)
    api.external.addGlobal('my-great-global', fn)

    expect(env.addGlobal).toHaveBeenCalledWith('my-great-global', fn)
  })

  it('Should add globals to the environment', () => {
    const fn = () => {}
    const env = { getGlobal: jest.fn().mockReturnValue(fn) }

    api.setEnvironment(env)

    expect(api.external.getGlobal('my-great-global')).toBe(fn)
  })

  it('Should log a warning when trying to get a global before the environment is set', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})

    api.external.getGlobal('my-great-global')

    expect(console.warn).toHaveBeenCalledWith('Trying to get global before the environment is set, couldn\'t retrieve global [my-great-global]')
  })

  it('Should log a warning when trying to get a global that doesn\'t exist', () => {
    const env = {
      getGlobal: (name) => {
        throw new Error('global not found: ' + name)
      }
    }

    api.setEnvironment(env)
    api.external.getGlobal('my-great-global')

    expect(console.warn).toHaveBeenCalledWith('Couldn\'t retrieve global [my-great-global]')
  })

  it('Should re-throw errors other than "global not found".', () => {
    const error = new Error('Some other error')
    error.code = 'ERR'
    const env = {
      getGlobal: () => {
        throw error
      }
    }

    api.setEnvironment(env)

    expect(() => {
      api.external.getGlobal('my-great-global')
    }).toThrow(error)
  })

  it('Should allow adding globals before setting environment', () => {
    const env = { addGlobal: jest.fn() }
    const fn = () => {}

    api.external.addGlobal('my-great-global', fn)
    api.setEnvironment(env)

    expect(env.addGlobal).toHaveBeenCalledWith('my-great-global', fn)
  })

  it('Should add globals in the right order when environment is set', () => {
    const namesInOrder = []
    const env = { addGlobal: jest.fn((name) => { namesInOrder.push(name) }) }

    api.external.addGlobal('my-great-global', () => {})
    api.external.addGlobal('someone-elses-global', () => {})
    api.external.addGlobal('a-third-global', () => {})
    api.setEnvironment(env)

    expect(namesInOrder).toEqual(['my-great-global', 'someone-elses-global', 'a-third-global'])
  })
})
