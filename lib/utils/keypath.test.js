const { getKeypath } = require('./keypath')

describe('getKeypath', () => {
  const data = {
    foo: 'bar',
    'field-name': 'value',
    parent: {
      child: 'baz',
      'field-name': 'nested value'
    }
  }

  it('returns a top-level value for a simple name', () => {
    expect(getKeypath(data, 'foo')).toBe('bar')
  })

  it('returns a top-level value for bracket notation', () => {
    expect(getKeypath(data, "['field-name']")).toBe('value')
  })

  it('returns a nested value for dot notation', () => {
    expect(getKeypath(data, 'parent.child')).toBe('baz')
  })

  it('returns a nested value for bracket notation', () => {
    expect(getKeypath(data, "['parent']['child']")).toBe('baz')
  })

  it('returns a nested value with a hyphenated key for bracket notation', () => {
    expect(getKeypath(data, "['parent']['field-name']")).toBe('nested value')
  })

  it('returns undefined for a missing key', () => {
    expect(getKeypath(data, 'unknown')).toBeUndefined()
  })

  it('returns undefined when part of the path is missing', () => {
    expect(getKeypath(data, 'unknown.child')).toBeUndefined()
    expect(getKeypath(data, "['unknown']['child']")).toBeUndefined()
  })

  it('returns undefined when the path crosses a non-object value', () => {
    expect(getKeypath(data, 'foo.child')).toBeUndefined()
  })
})
