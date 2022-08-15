const { mkReleaseArchive } = require('./index')

module.exports = async function () {
  process.stdout.write('\nDoing global setup...')
  process.env.KIT_JEST_RUN_ID = process.ppid
  const releaseArchive = await mkReleaseArchive()
  process.stdout.write('done\n')
  process.stdout.write(`Test release archive is at '${releaseArchive}'\n`)
}
