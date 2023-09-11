// CustomWorld.js
const { World } = require('@cucumber/cucumber')
const seleniumWebdriver = require('selenium-webdriver')
const { startKit, resetState } = require('./initKit')

const cheerio = require('cheerio')

/*
 * The only method to be inherited from the default world is
 * the constructor, so if you want to handle the options in
 * an entirely customized manner you don't have to extend from
 * World as seen here.
 */
class CustomWorld extends World {
  driver = null

  /*
   * A constructor is only needed if you have custom actions
   * to take after the Cucumber parses the options or you
   * want to override how the options are parsed.
   * 
   * The options are an object with three members
   * {
   *   log: Cucumber log function,
   *   attach: Cucumber attachment function,
   *   params: World Parameters object
   * }
   */
  constructor (options) {
    /*
     * If you don't call the super method you will need
     * to bind the options here as you see fit.
     */
    console.log('custom world')
    super(options)
    // Custom actions go here.
  }

  /*
   * Constructors cannot be asynchronous! To work around this we'll
   * use an init method with the Before hook
   */
  async init (scenario) {
    console.log('initialising scenario', scenario)
    await Promise.all([
      this.startKitIfNotRunning(),
      this.getDriver()
    ])
  }

  async getDriver () {
    if (!this.driver) {
      this.driver = await new seleniumWebdriver.Builder().withCapabilities(seleniumWebdriver.Capabilities.chrome()).build()
      this.driver.manage().setTimeouts({ implicit: 2000 })
    }
    return this.driver
  }

  async startKitIfNotRunning (config) {
    if (this.runningKit) {
      return
    }
    this.runningKit = await startKit(config)
    return this.runningKit
  }

  async resetState () {
    if (!this.runningKit) {
      return
    }
    await resetState(this.runningKit)
  }

  async cleanup () {
    if (this.driver) {
      this.driver.quit()
    }
    if (this.runningKit) {
      this.runningKit.close()
    }
    console.log('finished.')
  }
  
  async wait (millis) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, millis)
    })
  }

  async visit (relativeUrl) {
    const delayBetweenRetries = 500
    let attemptNumber = 1
    let retries = 10
    let success = false
    if (!this.driver) {
      throw new Error(`Can't visit the URL ${relativeUrl} because WebDriver - fix this by running .init`)
    }
    if (!this.runningKit) {
      throw new Error(`Can't visit the URL ${relativeUrl} because the kit isn't running - fix this by running .startKitIfNotRunning or .startKitAndReplaceIfRunning`)
    }
    const url = `${this.runningKit.serverAddress}${relativeUrl}`
    console.log('visiting url', url)
    while (success === false) {
      try {
        console.log('loading [%s] attempt [%s]', url, attemptNumber++)
        await this.driver.get(url)
        success = true
      } catch (e) {
        if (retries-- > 0) {
          await this.wait(delayBetweenRetries)
        } else {
          throw e
        }
      }
    }
  }
}

module.exports = {
  CustomWorld
}
