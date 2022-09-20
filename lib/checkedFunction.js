/* eslint-env jest */

const nunjucks = require('nunjucks')
const viewsApi = require('./views/api')
require('./views/coreFilters')

let checked
let ctx

describe('checked', () => {
  beforeAll(() => {
    const env = new nunjucks.Environment()
    viewsApi.setEnvironment(env)
    ctx = { data: {} }
    checked = env.getGlobal('checked').bind({ ctx })
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
