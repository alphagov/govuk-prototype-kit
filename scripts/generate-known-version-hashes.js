import fs from "fs";
import path from "path";
import { getFileHash } from "../migrator/file-helpers.js";
import fse from "fs-extra";
import os from "os";
import { exec } from "../lib/exec.js";
const tmpDir = path.join(os.tmpdir(), 'govuk-prototype-kit', 'finding-known-files');
const knownFiles = [
    'LICENCE.txt',
    'app/assets/images/separator-2x.png',
    'app/assets/images/separator.png',
    'app/assets/images/unbranded.ico',
    'app/assets/javascripts/application.js',
    'app/assets/javascripts/auto-store-data.js',
    'app/assets/javascripts/jquery-1.11.3.js',
    'app/assets/sass/application.scss',
    'app/assets/sass/patterns/_check-your-answers.scss',
    'app/assets/sass/patterns/_contents-list.scss',
    'app/assets/sass/patterns/_mainstream-guide.scss',
    'app/assets/sass/patterns/_pagination.scss',
    'app/assets/sass/patterns/_related-items.scss',
    'app/assets/sass/patterns/_step-by-step-header.scss',
    'app/assets/sass/patterns/_step-by-step-nav.scss',
    'app/assets/sass/patterns/_step-by-step-navigation.scss',
    'app/assets/sass/patterns/_step-by-step-related.scss',
    'app/assets/sass/patterns/_task-list.scss',
    'app/assets/sass/unbranded.scss',
    'app/filters.js',
    'app/views/includes/breadcrumb_examples.html',
    'app/views/includes/cookie-banner.html',
    'app/views/includes/head.html',
    'app/views/includes/scripts.html',
    'app/views/layout.html',
    'app/views/layout_unbranded.html'
];
const versions = [
    '12.3.0',
    '12.2.0',
    '12.1.1',
    '12.1.0',
    '12.0.4',
    '12.0.3',
    '12.0.2',
    '12.0.1',
    '12.0.0',
    '11.0.0',
    '10.0.0',
    '9.15.0',
    '9.14.2',
    '9.14.1',
    '9.14.0',
    '9.13.0',
    '9.12.1',
    '9.12.0',
    '9.11.2',
    '9.11.1',
    '9.11.0',
    '9.10.1',
    '9.10.0',
    '9.9.0',
    '9.8.0',
    '9.7.0',
    '9.6.1',
    '9.6.0',
    '9.5.0',
    '9.4.0',
    '9.3.0',
    '9.2.0',
    '9.1.0',
    '9.0.0',
    '8.12.1',
    '8.12.0',
    '8.11.0',
    '8.10.0',
    '8.9.0',
    '8.8.0',
    '8.7.0',
    '8.6.0',
    '8.5.0',
    '8.4.0',
    '8.3.0',
    '8.2.0',
    '8.1.0',
    '8.0.0',
    '7.1.0',
    '7.0.0'
];
const hashJsonPath = path.join(__dirname, '..', 'migrator', 'known-old-versions.json');
async function retrieveArchiveVersion(version) {
    await exec(`wget https://github.com/alphagov/govuk-prototype-kit/archive/refs/tags/v${version}.tar.gz`, { cwd: tmpDir });
    await exec(`tar -xzpf v${version}.tar.gz`, { cwd: tmpDir });
}
async function processVersion(version) {
    await retrieveArchiveVersion(version);
    const versionData = await Promise.all(knownFiles.map(async (knownFile) => {
        const filePath = path.join(tmpDir, `govuk-prototype-kit-${version}`, knownFile);
        if (await fse.pathExistsSync(filePath)) {
            return { filename: knownFile, hash: await getFileHash(filePath) };
        }
    }));
    return versionData.filter(hasData => !!hasData);
}
async function buildFileHashList() {
    return (await Promise.all(versions.map(processVersion))).flat();
}
async function groupFileHashes(hashList) {
    return hashList.reduce((fileHashes, { filename, hash }) => {
        if (!fileHashes[filename]) {
            fileHashes[filename] = [];
        }
        if (!fileHashes[filename].includes(hash)) {
            fileHashes[filename].push(hash);
        }
        return fileHashes;
    }, {});
}
async function removeTemporaryFiles() {
    await fse.remove(tmpDir).catch(e => {
        console.log(e);
    });
}
(async () => {
    await removeTemporaryFiles();
    await fse.ensureDir(tmpDir);
    const hashList = await buildFileHashList();
    const fileHashes = await groupFileHashes(hashList);
    const fileContent = JSON.stringify(fileHashes, null, 2);
    fs.writeFileSync(hashJsonPath, fileContent);
    await removeTemporaryFiles();
})();
