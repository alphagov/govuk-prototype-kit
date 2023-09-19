async function asyncSeriesMap (arr, handler) {
  const results = []
  let index = -1
  while (arr.length > ++index) {
    results.push(await handler(arr[index], index, arr))
  }
  return results
}

module.exports = {
  asyncSeriesMap
}
