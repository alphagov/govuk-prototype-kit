import path from "path";
import del from "del";
import fse from "fs-extra";
import fs from "graceful-fs";
import sass from "sass";
import { mkdtempSync } from "../utils/index.js";
import { packageDir, projectDir } from "../../lib/utils/paths.js";
import { generateAssetsSync } from "../../lib/build.js";
const testDir = path.join(mkdtempSync(), 'build');
process.env.KIT_PROJECT_DIR = testDir;
describe('the build pipeline', () => {
    describe('generate assets', () => {
        beforeAll(() => {
            expect(fs.existsSync(path.join('app', 'assets', 'test'))).toBe(false);
            jest.spyOn(fs, 'chmodSync').mockImplementation(() => { });
            jest.spyOn(fse, 'chmodSync').mockImplementation(() => { });
            jest.spyOn(fs, 'copyFileSync').mockImplementation(() => { });
            jest.spyOn(fse, 'copyFileSync').mockImplementation(() => { });
            jest.spyOn(fse, 'ensureDirSync').mockImplementation(() => { });
            jest.spyOn(fs, 'mkdirSync').mockImplementation(() => { });
            jest.spyOn(fse, 'mkdirSync').mockImplementation(() => { });
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { });
            jest.spyOn(fse, 'writeFileSync').mockImplementation(() => { });
            jest.spyOn(sass, 'compile').mockImplementation((css, options) => ({ css }));
            generateAssetsSync();
        });
        afterAll(() => {
            jest.restoreAllMocks();
            del([path.join('app', 'assets', 'test')]);
        });
        it('makes the plugins sass file', () => {
            expect(fse.ensureDirSync).toHaveBeenCalledWith(path.join(projectDir, '.tmp', 'sass'), { recursive: true });
            expect(fse.writeFileSync).toHaveBeenCalledWith(path.join(projectDir, '.tmp', '.gitignore'), '*');
            expect(fse.writeFileSync).toHaveBeenCalledWith(path.join(projectDir, '.tmp', 'sass', '_plugins.scss'), expect.stringContaining('$govuk-plugins-url-context'));
        });
        it('compiles sass', () => {
            const options = {
                quietDeps: true,
                loadPaths: [projectDir],
                sourceMap: true,
                style: 'expanded'
            };
            expect(sass.compile).toHaveBeenCalledWith(expect.stringContaining(path.join(packageDir, 'lib', 'assets', 'sass', 'prototype.scss')), expect.objectContaining(options));
            expect(fse.writeFileSync).toHaveBeenCalledWith(path.join(projectDir, '.tmp', 'public', 'stylesheets', 'application.css'), path.join(packageDir, 'lib', 'assets', 'sass', 'prototype.scss'));
            expect(sass.compile).not.toHaveBeenCalledWith(expect.stringContaining(path.join('app', 'assets', 'sass', 'application.scss')), expect.objectContaining(options));
        });
    });
});
