#! /usr/bin/env node
const { promisify } = require('node:util');
const exec = promisify(require('node:child_process').exec);
const _ = require('lodash');
const { writeFile, readFile } = require('node:fs/promises');
const { writeFileSync } = require('node:fs');

;(async () => {    
    // Get the list of installed dependencies. Unfortunately `--omit` excludes transitive dependencies
    // so we need to use `--all`
    const {stdout} = await exec('npm ls --all --json')

    const installedDependencies = JSON.parse(stdout).dependencies;

    // Get the list of of non-dev dependencies for the Kit
    const package = JSON.parse(await readFile('package.json'), {encoding: 'utf-8'})

    for (const dependencyName of Object.keys(package.dependencies)) {
        const installedDependency = installedDependencies[dependencyName];
        // Update the direct dependency
        pinDirectDependency(package, dependencyName, installedDependency.version)
        // Traverse the transitive dependencies to create overrides
        traverse([{
            name: dependencyName,
            ...installedDependency
        }], 'dependencies', (dependencyPath) => {
            // TODO: We can be more clever in grouping dependencies
            pinTransitiveDependency(package,dependencyPath)
        })
    }

    await writeFile('package.json', JSON.stringify(package, null, 2), {encoding: 'utf-8'})
})()

function pinDirectDependency(package, dependencyName, version) {
    console.log(`Pinning ${dependencyName} at ${version}`)
    _.set(package,`dependencies.${dependencyName}`, version);
}

function pinTransitiveDependency(package,dependencyPath) {
    const dependency = dependencyPath.pop();

    if (!dependency.version) return;

    const ancestors = dependencyPath.map(({name, version}) => `["${name}@${version}"]`);
    ancestors.push(`["${dependency.name}"]`)
    console.log(`overrides${ancestors.join('')}`,dependency.version )
    _.set(package, `overrides${ancestors.join('')}`, dependency.version)
}

function traverse(ancestors, property, callback) {
    const toTraverse = ancestors.at(-1)[property];
    // Stop traversing if there's no property on the object
    if (!toTraverse) {
        return;
    }
    
    for(const [name, metadata] of Object.entries(toTraverse)) {
        if (metadata){
            const metadataWithName = {name, ...metadata};
            callback([...ancestors, metadataWithName]);
            traverse([...ancestors, metadataWithName], property, callback)
        }
    }
}

