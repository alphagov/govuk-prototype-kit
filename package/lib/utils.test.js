/* eslint-env jest */

const nunjucks = require('nunjucks')

const utils = require('./utils.js')

const originalEnvironmentVariables = process.env

describe('onGlitch', () => {
  beforeEach(() => {
    process.env = {}
  })

  afterEach(() => {
    process.env = originalEnvironmentVariables
  })

  it('returns false if envvar PROJECT_REMIX_CHAIN is not set', () => {
    expect(utils.onGlitch()).toBe(false)
  })

  it('returns true if envvar PROJECT_REMIX_CHAIN is set', () => {
    process.env.PROJECT_REMIX_CHAIN = '["dead-beef"]'
    expect(utils.onGlitch()).toBe(true)
  })
})

describe('getNodeEnd', () => {
  beforeEach(() => {
    process.env = {}
  })

  afterEach(() => {
    process.env = originalEnvironmentVariables
  })

  it('returns the value of NODE_ENV', () => {
    process.env.NODE_ENV = 'production'
    expect(utils.getNodeEnv()).toBe('production')

    process.env.NODE_ENV = 'test'
    expect(utils.getNodeEnv()).toBe('test')
  })

  it('defaults to development if NODE_ENV is not set or empty', () => {
    expect(utils.getNodeEnv()).toBe('development')

    process.env.NODE_ENV = ''
    expect(utils.getNodeEnv()).toBe('development')
  })

  it('always returns a lower-case string', () => {
    process.env.NODE_ENV = 'FOOBAR'
    expect(utils.getNodeEnv()).toBe('foobar')
  })

  it('returns production if running on Glitch and NODE_ENV not set or empty', () => {
    process.env.PROJECT_REMIX_CHAIN = '["dead-beef"]'
    expect(utils.getNodeEnv()).toBe('production')

    process.env.NODE_ENV = ''
    expect(utils.getNodeEnv()).toBe('production')
  })
})

describe('checked', () => {
  var ctx, checked

  beforeAll(() => {
    var env = new nunjucks.Environment()
    utils.addCheckedFunction(env)
    ctx = { data: {} }
    checked = env.getGlobal('checked').bind({ ctx })
  })

  it('can be added as global function to a nunjucks env', () => {
    var env = new nunjucks.Environment()
    utils.addCheckedFunction(env)
    expect(env.getGlobal('checked')).toBeDefined()
  })

  it('returns a string', () => {
    expect(checked('foo', 'bar')).toBe('')
  })

  it('returns checked if data has specified value', () => {
    ctx.data.foo = 'bar'
    expect(checked('foo', 'bar')).toBe('checked')
  })

  it('returns empty string if data does not has specified value', () => {
    ctx.data.foo = 'baz'
    expect(checked('foo', 'bar')).toBe('')
  })

  it('allows deep access into objects', () => {
    ctx.data.foo = 'bar'
    expect(checked('foo', 'bar')).toBe('checked')
    ctx.data.foo = { bar: 'baz' }
    expect(checked("['foo']['bar']", 'baz')).toBe('checked')
  })

  it('allows deep access using dot notation (undocumented)', () => {
    ctx.data.foo = { bar: 'baz' }
    expect(checked('foo.bar', 'baz')).toBe('checked')
  })
})

describe('autoStoreData', () => {
  const req = {
    session: {}
  }
  const res = { }

  beforeEach(() => {
    req.body = {}
    req.query = {}
    req.session.data = {
      existingData: 'existing data'
    }
    res.locals = {}
  })

  it('strips all properties where the name is prefixed with an underscore when saving the request query to the session and locals data', () => {
    req.query = {
      _omitMe: 'omit me',
      doIncludeMe: 'include me'
    }
    const expectedData = {
      doIncludeMe: 'include me',
      existingData: 'existing data'
    }
    utils.autoStoreData(req, res, () => {
      expect(res.locals.data).toEqual(expectedData)
      expect(req.session.data).toEqual(expectedData)
    })
  })

  it('removes all occurrences of the value "_unchecked" in checkboxes when saving the request body to the session and locals data', () => {
    req.body = {
      checkBoxes1: ['_unchecked', 'cb1-1', '_unchecked', '_unchecked', 'cb1-2', '_unchecked'],
      checkBoxes2: ['_unchecked', '_unchecked'],
      checkBoxes3: ['cb3-1', 'cb3-2'],
      existingData: 'existing data'
    }
    const expectedData = {
      checkBoxes1: ['cb1-1', 'cb1-2'],
      checkBoxes2: [],
      checkBoxes3: ['cb3-1', 'cb3-2'],
      existingData: 'existing data'
    }
    utils.autoStoreData(req, res, () => {
      expect(res.locals.data).toEqual(expectedData)
      expect(req.session.data).toEqual(expectedData)
    })
  })
})
