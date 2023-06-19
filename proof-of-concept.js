const {requestHttpsJson, requestHttps, findFileInHttpsTgz} = require("./lib/utils/requestHttps")
const {startPerformanceTimer, endPerformanceTimer} = require("./lib/utils/performance");

async function getConfigForPackage(packageName) {
  const timer = startPerformanceTimer()

  const registry = await requestHttpsJson(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
  const latestTag = registry['dist-tags']?.latest

  if (!latestTag) {
    return
  }

  const url = registry.versions[latestTag].dist.tarball
  const result = await findFileInHttpsTgz(url, {
    fileToFind: 'package/govuk-prototype-kit.config.json',
    prepare: str => {
      if (str && str.startsWith('{')) {
        return JSON.parse(str)
      }
    }
  })

  endPerformanceTimer('getConfigForPackage', timer)

  return result
}

async function demo(packageName) {
  console.log('')
  console.log('')

  const result = await getConfigForPackage(packageName);

  console.log('')
  console.log('')

  console.log(result)

  console.log('')
  console.log('')
}

(async () => {
  const timer = startPerformanceTimer()
  await demo('govuk-prototype-kit')
  await demo('hmrc-frontend')
  await demo('govuk-frontend')
  await demo('@x-govuk/edit-prototype-in-browser')
  // await demo('nhsuk-frontend')
  endPerformanceTimer('Demo', timer)
})()
