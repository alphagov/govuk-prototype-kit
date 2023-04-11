import os from "os";
import path from "path";
import { sanitisePaths } from "./logger.js";
/* eslint-env jest */
describe('sanitisePaths', () => {
    it('replaces occurences of home directory with ~', () => {
        expect(sanitisePaths(path.join(os.homedir(), 'path', 'to', 'folder'))).toEqual(path.join('~', 'path', 'to', 'folder'));
    });
    it('replaces all occurences in a string', () => {
        expect(sanitisePaths(process.argv.join(' '))).not.toContain(os.homedir());
    });
});
