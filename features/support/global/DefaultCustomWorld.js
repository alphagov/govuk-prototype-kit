// CustomWorld.js
const { World } = require('@cucumber/cucumber')
const seleniumWebdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const { startKit, resetState } = require('./initKit')
const { verboseLogging, browserName, browserWidth, browserHeight, browserHeadless } = require('./config')
const verboseLog = verboseLogging ? console.log : () => {}
const sharedState = {}

/*
 * The only method to be inherited from the default world is
 * the constructor, so if you want to handle the options in
 * an entirely customized manner you don't have to extend from
 * World as seen here.
 */
class CustomWorld extends World {
  driver = null

  constructor (options) {
    /*
     * If you don't call the super method you will need
     * to bind the options here as you see fit.
     */
    super(options)
    // Custom actions go here.
  }

  /*
   * Constructors cannot be asynchronous! To work around this we'll
   * use an init method with the Before hook
   */
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
      this.runningKit = sharedState.runningKit = await this.retryOnFailure(async attemptNumber => {
        verboseLog('starting kit, attempt [%s]', attemptNumber)
        return await startKit(config)
      })
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
    const delayBetweenRetries = 500
    let attemptNumber = 1
    let retries = 10

    while (true) {
      try {
        return await fn(attemptNumber++)
      } catch (e) {
        if (retries-- > 0) {
          await this.wait(delayBetweenRetries)
        } else {
          throw e
        }
      }
    }
  }

  async visit (relativeUrl) {
    if (!sharedState.driver) {
      throw new Error(`Can't visit the URL ${relativeUrl} because WebDriver - fix this by running .init`)
    }
    if (!sharedState.runningKit) {
      throw new Error(`Can't visit the URL ${relativeUrl} because the kit isn't running - fix this by running .startKitIfNotRunning or .startKitAndReplaceIfRunning`)
    }
    const url = `${sharedState.runningKit.serverAddress}${relativeUrl}`
    return this.retryOnFailure(async (attemptNumber) => {
      verboseLog('loading [%s] attempt [%s]', url, attemptNumber++)
      return await sharedState.driver.get(url)
    })
  }
}

module.exports = {
  CustomWorld
}
