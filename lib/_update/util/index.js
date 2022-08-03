const fs = require('fs').promises
const path = require('path')

const { projectDir } = require('../../path-utils')
const { fetchOriginal } = require('./fetch-original')

const updateDir = path.join(projectDir, 'update')

async function getProjectVersion () {
  return (await fs.readFile(path.join(projectDir, 'VERSION.txt'), 'utf8')).trim()
}

// Normalise line endings so all strings have the same line endings as control
function normaliseLineEndings (control, ...targets) {
  const posixEOL = '\n'
  const win32EOL = '\r\n'
  if (control.includes(win32EOL)) {
    return targets.map((t) => {
      if (!t.includes(win32EOL)) {
        return t.replace(new RegExp(posixEOL, 'g'), win32EOL)
      }
      return t
    })
  }
  return targets
}

async function patchUserFile (originalVersion, filePath) {
  const theirs = await fs.readFile(path.resolve(projectDir, filePath), 'utf8')
  const originalUnnormalised = await fetchOriginal(originalVersion, filePath)
  const oursUnnormalised = await fs.readFile(path.resolve(updateDir, filePath), 'utf8')

  // Normalise line endings to match their file
  const [original, ours] = normaliseLineEndings(theirs, originalUnnormalised, oursUnnormalised)

  // It is possible that the file has already been upgraded, in which case there is nothing to do
  if (theirs === ours) {
    return
  }

  // If the user hasn't changed the file we can just replace it completely
  if (original === theirs) {
    return fs.copyFile(path.join(updateDir, filePath), path.join(projectDir, filePath))
  }

  // Otherwise, if the original code is contained as-is in their file, we can
  // remove the shared lines, and add our hints
  if (theirs.includes(original)) {
    let merged
    merged = theirs.replace(original, '')
    merged = ours + merged
    return fs.writeFile(path.resolve(projectDir, filePath), merged, 'utf8')
  }

  // If the original code is not recognisable, we should give up, but not
  // without giving a warning to the user
  console.warn(
    `WARNING: update.sh was not able to automatically update your ${filePath} file.\n` +
    'If you have a problem when running your prototype contact the GOV.UK Prototype team for support,\n' +
    'using one of the methods listed at https://design-system.service.gov.uk/get-in-touch/'
  )
}

module.exports = {
  getProjectVersion,
  fetchOriginal,
  normaliseLineEndings,
  patchUserFile
}
