#!/bin/sh
set -e

get_package_info () {
  # Recursively find the value from the package.json
  npm pkg get "$@" --json | jq -r 'last(..)'
}

PACKAGE_NAME=$(get_package_info name)

# Use first argument as version or get it from the package.json
PACKAGE_VERSION=${1:-$(get_package_info version)}

# Use second argument as latest published version or get latest tag published on Github
LATEST_PUBLISHED_VERSION=${2:-$(npm view "$PACKAGE_NAME" version)}

version() { echo "$@" | awk -F. '{ printf("%d%03d%03d\n", $1,$2,$3); }'; }

if echo "$PACKAGE_VERSION" | grep -q "internal"; then
  NPM_TAG="internal"
elif echo "$PACKAGE_VERSION" | grep -q "-"; then
  NPM_TAG="next"
elif [ $(version "$PACKAGE_VERSION") -ge $(version "$LATEST_PUBLISHED_VERSION") ]; then
  NPM_TAG="latest"
else
  major_version_num=$(echo "$PACKAGE_VERSION" | cut -d. -f1)
  NPM_TAG="latest-v$major_version_num"
fi

echo "$NPM_TAG"
