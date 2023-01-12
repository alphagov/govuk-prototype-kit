module.exports = {
  overwriteDemo: () => demo(true),
  standardDemo: () => demo(false)
}

function demo (shouldOverwrite) {
  const speedMillis = 500
  const stages = [
    {
      timeMultiplier: 1,
      message: 'Creating your starter files'
    },
    {
      timeMultiplier: 4,
      message: 'Installing dependencies (this is the slowest step)'
    },
    {
      timeMultiplier: 1,
      message: 'Setting up your new prototype'
    }
  ]

  console.log('Creating your prototype')
  console.log('')

  const fns = stages.map((stage, id) => () => new Promise((res, rej) => {
    if (shouldOverwrite) {
      process.stdout.clearLine(-1)
      process.stdout.cursorTo(0)
    }
    const message = `${id + 1}/${stages.length}: ${stage.message}`
    process.stdout.write(message)

    setTimeout(() => {
      if (!shouldOverwrite) {
        console.log(' ✓')
      }
      res()
    }, speedMillis * stage.timeMultiplier)
  }))

  fns.push(() => {
    if (shouldOverwrite) {
      process.stdout.clearLine(-1)
      process.stdout.cursorTo(0)
    } else {
      console.log('')
    }
    console.log('Your prototype has been created.')
  })

  ;(async () => {
    while (fns.length > 0) {
      await fns.shift()()
    }
  })()

}
