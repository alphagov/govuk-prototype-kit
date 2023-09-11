// setup.js
const { Status, Before, After, setWorldConstructor, AfterAll } = require('@cucumber/cucumber')
const { CustomWorld } = require('./global/DefaultCustomWorld')
const fsp = require('fs/promises')
const path = require('path')
const { longTimeout } = require('./global/config')

setWorldConstructor(CustomWorld)

Before({ timeout: longTimeout }, async function (scenario) {
  await this.init(scenario)
})

After({ timeout: longTimeout }, async function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    const screenshot = await this.driver.takeScreenshot()
    await fsp.writeFile(path.join(__dirname, '..', `${testCase.pickle.name}${new Date().getTime()}.png`), screenshot, 'base64')
    this.attach(screenshot, {
      mediaType: 'base64:image/png',
      fileName: 'screenshot.png'
    })
  }
  await this.resetState()
})

AfterAll(async function () {
  await CustomWorld.CleanupEverything()
})
