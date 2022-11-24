#!/bin/sh
#
# Meant to be used with https://github.com/shashkovdanil/clean-publish#readme
# npx clean-publish --before-script scripts/clean-publish-before-script.sh

set -euo pipefail

cd "$1"

# clean-publish removes devDependencies from package.json, but we need to
# run npm install so devDependencies are removed from npm-shrinkwrap.json
npm install
