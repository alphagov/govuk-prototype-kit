// npm dependencies
const { styleText } = require('node:util')

// local dependencies
const logger = require('./logger')

async function reportSuccess (tag) {
  const message = `Succeeded [${tag}]`
  console.log(styleText('green', message))
  await logger.log(message)
}

async function reportFailure (tag, link) {
  const message = `Failed [${tag}]${link ? ` - documentation for the manual process is here: ${link}` : ''}`
  console.warn(styleText('yellow', message))
  await logger.log(message)
}

async function addReporter (tag, link) {
  await logger.log(`Started [${tag}]`)
  return async (result) => {
    if (result === true) {
      await reportSuccess(tag)
    } else if (result === false) {
      await reportFailure(tag, link)
    }
    return result
  }
}

module.exports = {
  reportSuccess,
  reportFailure,
  addReporter
}
