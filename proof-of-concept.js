const {startPerformanceTimer, endPerformanceTimer} = require("./lib/utils/performance")
const {getConfigForPackage} = require("./lib/utils/requestHttps");

async function demo(packageName) {
  await getConfigForPackage(packageName);

  console.log('got result for ', packageName)
}

(async () => {
  const timer = startPerformanceTimer()
  await demo('govuk-prototype-kit')
  await demo('hmrc-frontend')
  await demo('govuk-frontend')
  await demo('@x-govuk/edit-prototype-in-browser')
  await demo('nhsuk-frontend')
  await demo('lkasdjflkajsdflkfjsad')
  endPerformanceTimer('Demo', timer)
})()
