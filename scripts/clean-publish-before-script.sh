#!/bin/bash
#
# Meant to be used with https://github.com/shashkovdanil/clean-publish#readme
# npx clean-publish --before-script scripts/clean-publish-before-script.sh

set -euo pipefail

cd "$1"

# clean-publish removes devDependencies from package.json before publishing.
# Do not generate or publish npm-shrinkwrap.json here: this package is intended
# to let consuming prototypes update or override dependency resolutions.
rm -f npm-shrinkwrap.json
