// CustomWorld.js
const { World } = require('@cucumber/cucumber')
const seleniumWebdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const { startKit, resetState } = require('./initKit')
const { verboseLogging, browserName, browserWidth, browserHeight, browserHeadless, fnRetryDelay, fnRetries } = require('./config')
const verboseLog = verboseLogging ? console.log : () => {}
const sharedState = {}

class CustomWorld extends World {
  driver = null

  async init () {
    await Promise.all([
      this.startKitIfNotRunning(),
      this.getDriver()
    ])
  }

  async getDriver () {
    const setOptions = (obj) => {
      let objUpdated = obj
      if (browserHeadless) {
        objUpdated = objUpdated.headless()
      }
      objUpdated.windowSize({
        width: browserWidth,
        height: browserHeight
      })
      return objUpdated
    }
    if (!sharedState.driver) {
      sharedState.driver = await new seleniumWebdriver.Builder().forBrowser(browserName)
        .setChromeOptions(setOptions(new chrome.Options()))
        .setFirefoxOptions(setOptions(new firefox.Options()))
        .build()

      await sharedState.driver.manage().setTimeouts({ implicit: 2000 })
    }
    this.driver = sharedState.driver
    return this.driver
  }

  async startKitIfNotRunning (config) {
    if (!sharedState.runningKit) {
      this.runningKit = sharedState.runningKit = await this.retryOnFailure(async ({ attemptNumber, previousError }) => {
        verboseLog('Previous error', previousError)
        verboseLog('starting kit, attempt [%s]', attemptNumber)
        return await startKit(config)
      })
      console.log('Kit running at:', this.runningKit.directory)
    }
    this.runningKit = sharedState.runningKit
    return this.runningKit
  }

  async resetState () {
    if (!sharedState.runningKit) {
      return
    }
    await resetState(sharedState.runningKit)
  }

  static async CleanupEverything () {
    if (sharedState.driver) {
      sharedState.driver.quit()
    }
    if (sharedState.runningKit) {
      sharedState.runningKit.close()
    }
  }

  async wait (millis) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, millis)
    })
  }

  async retryOnFailure (fn) {
    const delayBetweenRetries = fnRetryDelay
    let attemptNumber = 1
    let retries = fnRetries

    let previousError

    while (true) {
      try {
        return await fn({
          attemptNumber: attemptNumber++,
          previousError
        })
      } catch (e) {
        if (--retries > 0) {
          previousError = e
          await this.wait(delayBetweenRetries)
        } else {
          throw e
        }
      }
    }
  }

  async visit (relativeUrl, checkContent = async () => {}) {
    if (!sharedState.driver) {
      throw new Error(`Can't visit the URL ${relativeUrl} because WebDriver - fix this by running .init`)
    }
    if (!sharedState.runningKit) {
      throw new Error(`Can't visit the URL ${relativeUrl} because the kit isn't running - fix this by running .startKitIfNotRunning or .startKitAndReplaceIfRunning`)
    }
    const url = `${sharedState.runningKit.serverAddress}${relativeUrl}`
    await this.retryOnFailure(async ({ attemptNumber, previousError }) => {
      verboseLog('previousError ' + previousError)
      verboseLog('loading [%s] attempt [%s], time [%s]', url, attemptNumber++, new Date().toISOString())
      await sharedState.driver.get(url)
      await checkContent(attemptNumber)
    })
  }
}

module.exports = {
  CustomWorld
}
