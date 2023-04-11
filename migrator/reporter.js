import c from "ansi-colors";
import logger from "./logger.js";
async function reportSuccess(tag) {
    const message = `Succeeded [${tag}]`;
    console.log(c.green(message));
    await logger.log(message);
}
async function reportFailure(tag, link) {
    const message = `Failed [${tag}]${link ? ` - documentation for the manual process is here: ${link}` : ''}`;
    console.warn(c.yellow(message));
    await logger.log(message);
}
async function addReporter(tag, link) {
    await logger.log(`Started [${tag}]`);
    return async (result) => {
        if (result === true) {
            await reportSuccess(tag);
        }
        else if (result === false) {
            await reportFailure(tag, link);
        }
        return result;
    };
}
export { reportSuccess };
export { reportFailure };
export { addReporter };
export default {
    reportSuccess,
    reportFailure,
    addReporter
};
