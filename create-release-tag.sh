#!/bin/bash
set -ex

# Create a new tag if the version file has been updated and a tag for that
# version doesn't already exist.

# Are we on master branch?
# We shouldn't push tags for version bump branches.

if [[ "$TRAVIS_BRANCH" == "master" ]]; then
  # get the version from the version file
  VERSION_TAG="v`cat VERSION.txt`"

  # check to make sure the tag doesn't already exist
  if ! git rev-parse $VERSION_TAG >/dev/null 2>&1; then
    echo "Creating new tag: $VERSION_TAG"
    git tag $VERSION_TAG
    git push origin $VERSION_TAG
  fi
else
  echo "Not creating release tag because we're on a branch..."
fi
