import os from "os";
import path from "path";
import { mkPrototype, startPrototype, installPlugins } from "../../__tests__/utils/index.js";
const defaultKitPath = path.join(os.tmpdir(), 'cypress', 'test-prototype');
const testDir = path.resolve(process.env.KIT_TEST_DIR || defaultKitPath);
(async () => {
    await mkPrototype(testDir, { overwrite: true, allowTracking: false, npmInstallLinks: true });
    const fooLocation = path.join(__dirname, '..', 'fixtures', 'plugins', 'plugin-foo');
    const barLocation = path.join(__dirname, '..', 'fixtures', 'plugins', 'plugin-bar');
    await installPlugins(testDir, [
        '@govuk-prototype-kit/step-by-step@1',
        `"file:${fooLocation}"`,
        `"file:${barLocation}"`
    ]);
    if (process.argv.includes('--prodtest')) {
        await startPrototype(testDir, 'production');
    }
    else {
        await startPrototype(testDir);
    }
})();
