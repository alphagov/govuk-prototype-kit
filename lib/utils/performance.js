const config = require('../config').getConfig()

const noopFn = () => {
}
const performanceLog = []
const startPerformanceTimer = config.logPerformance || config.logPerformanceSummary ? () => process.hrtime() : noopFn
const endPerformanceTimer = config.logPerformance || config.logPerformanceSummary
  ? (name, timer) => {
      const hrTime = process.hrtime(timer)
      const timeTaken = (hrTime[0] * 1000000 + hrTime[1] / 1000) / 1000
      addToSummary(name, timeTaken)
      logPerformance(name, timeTaken)
    }
  : noopFn
const logPerformanceMatching = config.logPerformanceMatching && config.logPerformanceMatching.split(',')
const logPerformance = config.logPerformance
  ? logPerformanceMatching
    ? (name, timeTaken) => {
        if (logPerformanceMatching.find(str => name.includes(str))) {
          console.log('Performance: [%s] took [%s]ms', name, timeTaken)
        }
      }
    : (name, timeTaken) => {
        console.log('Performance: [%s] took [%s]ms', name, timeTaken)
      }
  : noopFn
const addToSummary = config.logPerformanceSummary ? (name, timeTaken) => performanceLog.push({ name, timeTaken }) : noopFn

const logPerformanceSummaryOnce = config.logPerformanceSummary
  ? () => {
      const summary = {}
      const output = {}
      performanceLog.forEach(({ name, timeTaken }) => {
        const obj = summary[name] = summary[name] || { total: 0, count: 0 }
        obj.total += timeTaken
        obj.count++
      })
      Object.keys(summary).forEach((name) => {
        const item = summary[name]
        output[name] = {
          'Average (ms)': (Math.round((item.total / item.count) * 100) / 100),
          Count: item.count
        }
      })
      console.log('Performance summary:')
      console.log('')
      console.table(output)
    }
  : noopFn

if (config.logPerformanceSummary) {
  let topLevelModule = module.parent
  while (topLevelModule.parent !== null) {
    topLevelModule = topLevelModule.parent
  }
  if (topLevelModule.filename.endsWith('listen-on-port.js')) {
    setInterval(logPerformanceSummaryOnce, config.logPerformanceSummary)
  }
}

module.exports = {
  startPerformanceTimer,
  endPerformanceTimer,
  logPerformanceSummaryOnce
}
