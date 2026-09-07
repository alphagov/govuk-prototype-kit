const cookieParser = require('./cookie-parser')

function runMiddleware (cookieHeader) {
  const req = { headers: {} }
  if (cookieHeader !== undefined) {
    req.headers.cookie = cookieHeader
  }
  cookieParser()(req, {}, () => {})
  return req.cookies
}

describe('cookieParser middleware', () => {
  it('parses a single cookie', () => {
    expect(runMiddleware('authentication=abc123')).toEqual({ authentication: 'abc123' })
  })

  it('parses multiple cookies', () => {
    expect(runMiddleware('a=1; b=two; c=three')).toEqual({ a: '1', b: 'two', c: 'three' })
  })

  it('returns an empty object when there is no cookie header', () => {
    expect(runMiddleware(undefined)).toEqual({})
  })

  it('decodes percent-encoded values', () => {
    expect(runMiddleware('greeting=hello%20world')).toEqual({ greeting: 'hello world' })
  })

  it('keeps the first cookie when a name is repeated', () => {
    expect(runMiddleware('a=1; a=2')).toEqual({ a: '1' })
  })

  it('ignores segments without an equals sign', () => {
    expect(runMiddleware('a=1; broken; b=2')).toEqual({ a: '1', b: '2' })
  })
})
