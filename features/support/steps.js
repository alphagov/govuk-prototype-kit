const { expect } = require('expect')
const { Given, When, Then } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const { longTimeout } = require('./global/config')
const fsp = require('fs/promises')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const installedPluginsUrl = '/manage-prototype/plugins-installed'
const pluginsUrl = '/manage-prototype/plugins'

const lookForH1 = self => async () => {
  return await self.driver.findElement(By.tagName('h1'))
}

When('I visit the installed plugins page', { timeout: longTimeout }, async function () {
  await this.visit(installedPluginsUrl, lookForH1(this))
})
When('I visit the available plugins page', { timeout: longTimeout }, async function () {
  await this.visit(pluginsUrl, lookForH1(this))
})

async function getPluginListItems (self) {
  return await Promise.all(await self.driver.findElements(By.className('govuk-prototype-kit-manage-prototype-plugin-list-plugin-list__item')))
}

async function getNamesOfPluginsOnPage (self) {
  const pluginListItems = await getPluginListItems(self)
  return await Promise.all(pluginListItems.map(async x => await x.findElement(By.className('plugin-details-link')).getText()))
}

Then('I should see the plugin {string} in the list', async function (pluginName) {
  expect(await getNamesOfPluginsOnPage(this)).toContain(pluginName)
})

Then('I should not see the plugin {string} in the list', async function (pluginName) {
  expect(await getNamesOfPluginsOnPage(this)).not.toContain(pluginName)
})

async function getTagsForPlugin (self, pluginName) {
  const tags = []
  await Promise.all((await getPluginListItems(self)).map(async x => {
    const text = (await x.findElement(By.className('plugin-details-link')).getText())
    if (text === pluginName) {
      const tagElems = await x.findElements(By.className('govuk-tag'))
      const names = await Promise.all(tagElems.map(elem => elem.getText()))
      names.forEach(z => tags.push(z))
    }
  }))
  return tags
}

Then('The {string} plugin should be tagged as {string}', async function (pluginName, tag) {
  expect(await getTagsForPlugin(this, pluginName)).toContain(tag.toUpperCase())
})

Then('The {string} plugin should not be tagged as {string}', async function (pluginName, tag) {
  expect(await getTagsForPlugin(this, pluginName)).not.toContain(tag.toUpperCase())
})

Given('I install the {string} plugin', async function (pluginNameOrRef) {
  // TODO: Support names as well as refs
  await this.visit(`/manage-prototype/plugin/${encodeURIComponent(pluginNameOrRef)}/install`)
  const installButton = await this.driver.findElement(By.id('plugin-action-button'))
  installButton.click()
})

Given('I uninstall the {string} plugin', async function (pluginNameOrRef) {
  // TODO: Support names as well as refs
  await this.visit(`/manage-prototype/plugin/${encodeURIComponent(pluginNameOrRef)}`, lookForH1(this))
  const uninstallButton = await this.driver.findElement(By.className('govuk-prototype-kit-plugin-uninstall-button'))
  uninstallButton.click()
})

Given('I update the {string} plugin', async function (pluginNameOrRef) {
  // TODO: Support names as well as refs
  await this.visit(`/manage-prototype/plugin/${encodeURIComponent(pluginNameOrRef)}`, lookForH1(this))
  const updateButton = await this.driver.findElement(By.className('govuk-prototype-kit-plugin-update-button'))
  updateButton.click()
})

Given(/I wait for the (?:uninstall|uninstall|update) to complete/, { timeout: longTimeout }, async function () {
  await this.retryOnFailure(async () => {
    await this.retryOnFailure(async () => {
      await this.driver.findElement(By.tagName('h1'))
    })
    const completed = await this.driver.wait(until.elementLocated(By.id('instructions-complete')))
    await this.driver.wait(until.elementIsVisible(completed), 20000)
  })
})

Given('I uninstall the {string} plugin using the command line', { timeout: longTimeout }, async function (npmPluginName) {
  await exec(`npm uninstall ${npmPluginName}`, { cwd: this.runningKit.directory })
  await new Promise((resolve) => {
    this.runningKit.kitStartedEventEmitter.once('started', async () => {
      await this.wait(1000)
      resolve()
    })
  })
})

Given('I have a the required SCSS to avoid plugins breaking when GOV.UK Frontend is uninstalled', async function () {
  const additionalScssPath = path.join(this.runningKit.directory, 'app', 'assets', 'sass', 'settings.scss')
  const additionalScssContents = `
@mixin govuk-text-colour {
  color: black;
}
@mixin govuk-font($size, $weight: regular, $tabular: false, $line-height: false) {
  font-size: $size
}
@mixin govuk-media-query($from) {
  @media (min-width: $from) { @content; }
}`
  await fsp.writeFile(additionalScssPath, additionalScssContents, 'utf8')
})

When('I should be informed that {string} will also be installed', async function (pluginName) {
  const heading = await this.driver.findElement(By.id('dependency-heading'))
  const listItems = await heading.findElements(By.tagName('li'))
  const matchinglistItems = (await Promise.all(listItems.map(async listItem => await listItem.getText()))).filter(name => pluginName)
  expect(matchinglistItems).toHaveLength(1)
})

When('I continue with the update', async function () {
  const button = await this.driver.findElement(By.id('plugin-action-button'))
  button.click()
})

Given('I wait {int} seconds', { timeout: longTimeout }, async function (seconds) {
  await this.wait(seconds * 1000)
})
