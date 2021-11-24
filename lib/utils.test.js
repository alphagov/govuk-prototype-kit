/* eslint-env jest */

const nunjucks = require('nunjucks')

const utils = require('./utils.js')

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
