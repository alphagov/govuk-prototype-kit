import fs from "fs";
import path from "path";
import utils from "../utils/index.js";
import { exec } from "../../lib/exec.js";
describe('npm install', () => {
    let testDir;
    beforeAll(async () => {
        const tmpDir = utils.mkdtempSync();
        testDir = path.join(tmpDir, 'install-no-optional');
        await utils.mkPrototype(testDir);
    }, 240000);
    it('does not install dev dependencies by default', async () => {
        await exec('npm install', { cwd: testDir });
        expect(fs.existsSync(path.join(testDir, 'node_modules', 'jest'))).toBe(false);
    });
});
