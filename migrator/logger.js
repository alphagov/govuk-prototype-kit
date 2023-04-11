import { promises } from "fs";
import os from "os";
import path from "path";
import { projectDir } from "../lib/utils/paths.js";
import package$0 from "../package.json" assert { type: "json" };
// core dependencies
const fs = { promises }.promises;
const packageVersion = package$0.version;
const migrateLogFilePath = path.join(projectDir, 'migrate.log');
let migrateLogFileHandle;
function sanitisePaths(str) {
    return str.replaceAll(os.homedir(), '~');
}
async function setup() {
    if (!migrateLogFileHandle) {
        migrateLogFileHandle = await fs.open(migrateLogFilePath, 'a');
        // log some information useful for debugging
        await module.exports.log(new Date().toISOString());
        await module.exports.log('cwd: ' + sanitisePaths(process.cwd()));
        await module.exports.log(`package: govuk-prototype-kit@${packageVersion}`);
        await module.exports.log('argv: ' + sanitisePaths(process.argv.join(' ')));
    }
}
async function teardown() {
    if (migrateLogFileHandle) {
        await migrateLogFileHandle.close();
    }
}
async function log(message) {
    await migrateLogFileHandle.write(message + '\n');
}
export { log };
export { sanitisePaths };
export { setup };
export { teardown };
export default {
    log,
    sanitisePaths,
    setup,
    teardown
};
