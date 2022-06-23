
module.exports = async function () {
  process.stdout.write('\nDoing global setup...')
  process.env.KIT_JEST_RUN_ID = process.ppid
  process.stdout.write('done\n')
}
