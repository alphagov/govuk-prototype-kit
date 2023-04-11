import os from "os";
import path from "path";
import { exec } from "../lib/exec.js";
import { mkPrototype } from "../__tests__/utils/index.js";
const testDir = path.resolve(process.env.KIT_TEST_DIR || path.join(os.tmpdir(), 'test-prototype'));
if (process.argv.length > 3) {
    console.log('Usage: create-prototype-and-run [command]');
    process.exit(2);
}
const command = process.argv.length === 3 ? process.argv[2] : 'npm run dev';
console.log(`creating test prototype in ${testDir}`);
console.log('and after changing directory');
console.log(`running prototype using command "${command}"`);
console.log();
mkPrototype(testDir, { overwrite: true, allowTracking: false })
    .then(() => {
    console.log();
    return exec(command, { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' });
});
