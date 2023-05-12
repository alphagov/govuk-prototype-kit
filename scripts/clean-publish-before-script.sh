#!/bin/bash
#
# Meant to be used with https://github.com/shashkovdanil/clean-publish#readme
# npx clean-publish --before-script scripts/clean-publish-before-script.sh

set -euo pipefail

cd "$1"

# clean-publish removes devDependencies from package.json, but we need to
# run npm install so devDependencies are removed from npm-shrinkwrap.json
npm install

# Remove `deprecated` lines from npm-shrinkwrap.json so users don't see
# warnings (but devs still will)
sed -i.bak '/deprecated/ d' npm-shrinkwrap.json
rm npm-shrinkwrap.json.bak
