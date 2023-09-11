// setup.js
const { Status, Before, After, setWorldConstructor } = require('@cucumber/cucumber')
const { CustomWorld } = require('./global/DefaultCustomWorld')
const fsp = require('fs/promises')
const path = require('path')

setWorldConstructor(CustomWorld)

Before({ timeout: 60 * 1000 }, async function (scenario) {
  await this.init(scenario)
})

After(async function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    console.log(testCase)
    const screenshot = await this.driver.takeScreenshot()
    await fsp.writeFile(path.join(__dirname, '..', `${testCase.pickle.name}${new Date().getTime()}.png`), screenshot, 'base64')
    console.log(testCase.pickle.name)
    this.attach(screenshot, {
      mediaType: 'base64:image/png',
      fileName: 'screenshot.png'
    })
  }
  this.resetState()
})
