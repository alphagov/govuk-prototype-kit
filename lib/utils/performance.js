import { getConfig } from "../config.js";
const config = { getConfig }.getConfig();
const noopFn = () => {
};
const performanceLog = [];
const logPerformanceMatching = config.logPerformanceMatching && config.logPerformanceMatching.split(',');
const startPerformanceTimerFn = () => process.hrtime();
const endPerformanceTimerFn = (name, timer) => {
    const hrTime = process.hrtime(timer);
    const timeTaken = (hrTime[0] * 1000000 + hrTime[1] / 1000) / 1000;
    addToSummary(name, timeTaken);
    logPerformance(name, timeTaken);
};
const addToSummaryFn = (name, timeTaken) => performanceLog.push({ name, timeTaken });
const logMatchingOutcomesOnly = (name, timeTaken) => {
    if (logPerformanceMatching.find(str => name.includes(str))) {
        console.log('Performance: [%s] took [%s]ms', name, timeTaken);
    }
};
const logAllOutcomes = (name, timeTaken) => {
    console.log('Performance: [%s] took [%s]ms', name, timeTaken);
};
const chooseOutcomeLogger = () => logPerformanceMatching ? logMatchingOutcomesOnly : logAllOutcomes;
const logPerformanceSummaryFn = () => {
    const summary = {};
    const output = {};
    performanceLog.forEach(({ name, timeTaken }) => {
        const obj = summary[name] = summary[name] || { total: 0, count: 0 };
        obj.total += timeTaken;
        obj.count++;
    });
    Object.keys(summary).forEach((name) => {
        const item = summary[name];
        output[name] = {
            'Average (ms)': (Math.round((item.total / item.count) * 100) / 100),
            Count: item.count
        };
    });
    console.log('Performance summary:');
    console.log('');
    console.table(output);
};
function getTopLevelModuleFilename() {
    let topLevelModule = module.parent;
    while (topLevelModule.parent !== null) {
        topLevelModule = topLevelModule.parent;
    }
    return topLevelModule.filename;
}
const logPerformance = config.logPerformance ? chooseOutcomeLogger() : noopFn;
const addToSummary = config.logPerformanceSummary ? addToSummaryFn : noopFn;
const logPerformanceSummaryOnce = config.logPerformanceSummary ? logPerformanceSummaryFn : noopFn;
if (config.logPerformanceSummary && getTopLevelModuleFilename().endsWith('listen-on-port.js')) {
    setInterval(logPerformanceSummaryOnce, config.logPerformanceSummary);
}
export const startPerformanceTimer = config.logPerformance || config.logPerformanceSummary ? startPerformanceTimerFn : noopFn;
export const endPerformanceTimer = config.logPerformance || config.logPerformanceSummary ? endPerformanceTimerFn : noopFn;
export { logPerformanceSummaryOnce };
export default {
    startPerformanceTimer,
    endPerformanceTimer,
    logPerformanceSummaryOnce
};
