const { expect } = require('expect')
const { Given, When, Then } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const { longTimeout } = require('./global/config')

const installedPluginsUrl = '/manage-prototype/plugins-installed'
const pluginsUrl = '/manage-prototype/plugins'

When('I visit the the installed plugins page', async function () {
  await this.visit(installedPluginsUrl)
})
When('I visit the the available plugins page', async function () {
  await this.visit(pluginsUrl)
})

async function getPluginListItems (self) {
  return await Promise.all(await self.driver.findElements(By.className('govuk-prototype-kit-manage-prototype-plugin-list-plugin-list__item')))
}

async function getNamesOfPluginsOnPage (self) {
  const pluginListItems = await getPluginListItems(self)
  return await Promise.all(pluginListItems.map(x => x.findElement(By.className('plugin-details-link')).getText()))
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

Given('I uninstall the {string} plugin', {timeout: longTimeout}, async function (pluginNameOrRef) {
  //TODO: Support names as well as refs
  await this.visit(`/manage-prototype/plugin/${encodeURIComponent(pluginNameOrRef)}`)
  const uninstallButton = await this.driver.findElement(By.className('govuk-prototype-kit-plugin-uninstall-button'))
  uninstallButton.click()
  const revealed = await this.driver.wait(until.elementLocated(By.id('instructions-complete')))
  await this.driver.wait(until.elementIsVisible(revealed), 20000)
})


