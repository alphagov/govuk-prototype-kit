const { getWorktreeCommit, mkReleaseArchive } = require('./index')

module.exports = async function () {
  process.stdout.write('\nDoing global setup...')
  const worktreeCommit = getWorktreeCommit()
  process.env.KIT_JEST_WORKTREE_COMMIT = worktreeCommit
  process.env.KIT_JEST_RUN_ID = process.ppid
  const releaseArchive = await mkReleaseArchive()
  process.stdout.write('done\n')
  process.stdout.write(`Test release archive is at '${releaseArchive}'\n`)
}
