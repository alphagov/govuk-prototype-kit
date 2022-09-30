const { exec } = require('../lib/exec')

const { getKitTestDir, mkPrototype } = require('../__tests__/util')

if (process.argv.length > 3) {
  console.log('Usage: create-prototype-and-test <NPM script name that starts prototype>')
  process.exit(2)
}

const command = process.argv.length === 3 ? process.argv[2] : 'npm run dev'
const testDir = getKitTestDir()

console.log(`creating test prototype in ${testDir}`)
console.log('and after changing directory')
console.log(`running prototype using command "${command}"`)
console.log()

mkPrototype(testDir, { overwrite: true, allowTracking: false })
  .then(() => {
    console.log()
    return exec(command, { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' })
  })
