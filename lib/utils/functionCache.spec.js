const { cacheFunctionCalls } = require('./functionCache')
describe('function cache', () => {
  it('should wrap a function without changing the behaviour', async () => {
    const fn = jest.fn().mockReturnValueOnce('Hi there')

    const wrapped = cacheFunctionCalls(fn)

    expect(fn).not.toHaveBeenCalled()

    const result = await wrapped('hello', 'world')

    expect(fn).toHaveBeenCalledWith('hello', 'world')
    expect(result).toBe('Hi there')

    expect(await wrapped('hello', 'world2')).toBe(undefined)
    expect(await wrapped('hello', 'world')).toBe('Hi there')
  })
})
