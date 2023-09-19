const { asyncSeriesMap } = require('./asyncSeriesMap')
describe('asyncSerialMap', () => {
  const nextTick = () => new Promise((resolve) => {
    process.nextTick(() => resolve())
  })

  it('should work through an array and return the results', async () => {
    const arr = ['abc', 'def', 'ghi']
    const handler = async (item) => `"${item}"`

    const result = await asyncSeriesMap(arr, handler)

    expect(result).toEqual([
      '"abc"',
      '"def"',
      '"ghi"'
    ])
  })

  it('should work through an array and return the results', async () => {
    const arr = ['abc', 'def', 'ghi']
    const handler = async (item, index, array) => `"${item}|${index}|${JSON.stringify(array)}"`

    const result = await asyncSeriesMap(arr, handler)

    expect(result).toEqual([
      '"abc|0|["abc","def","ghi"]"',
      '"def|1|["abc","def","ghi"]"',
      '"ghi|2|["abc","def","ghi"]"'
    ])
  })

  it('should run these in series', async () => {
    let latestResolve
    let callCount = 0
    const handler = (item) => new Promise((resolve, reject) => {
      callCount++
      latestResolve = resolve
    })

    const resultPromise = asyncSeriesMap(['abc', 'def', 'ghi'], handler)

    await nextTick()

    expect(callCount).toBe(1)
    latestResolve('this is the first')

    await nextTick()

    expect(callCount).toBe(2)
    latestResolve('this is the second')

    await nextTick()

    expect(callCount).toBe(3)
    latestResolve('this is the third')

    expect(await resultPromise).toEqual([
      'this is the first',
      'this is the second',
      'this is the third'
    ])
  })
})
