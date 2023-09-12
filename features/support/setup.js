// setup.js
const { Status, Before, After, setWorldConstructor, AfterAll } = require('@cucumber/cucumber')
const { CustomWorld } = require('./global/DefaultCustomWorld')
const fsp = require('fs/promises')
const fse = require('fs-extra')
const path = require('path')
const { longTimeout, screenshotOnFailure } = require('./global/config')

setWorldConstructor(CustomWorld)

Before({ timeout: longTimeout }, async function (scenario) {
  await this.init(scenario)
  await this.resetState()
})

After({ timeout: longTimeout }, async function (testCase) {
  if (testCase.result.status === Status.FAILED && screenshotOnFailure) {
    const screenshot = await this.driver.takeScreenshot()
    const filePath = path.join(__dirname, '..', 'screenshots', `${testCase.pickle.name}${new Date().getTime()}.png`)
    await fse.ensureDir(path.dirname(filePath))
    await fsp.writeFile(filePath, screenshot, 'base64')
    this.attach(screenshot, {
      mediaType: 'base64:image/png',
      fileName: 'screenshot.png'
    })
  }
})

AfterAll(async function () {
  await CustomWorld.CleanupEverything()
})
