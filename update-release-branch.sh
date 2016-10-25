#!/bin/bash
set -ex

# Update the latest-release branch with the most recent tagged release

# we want this to only happen from our repo, not forks
# check this is not a pull request
# check we're on the master branch

if [ "$TRAVIS_REPO_SLUG" == "alphagov/govuk_prototype_kit" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  # get the version from the version file
  VERSION_TAG="$(cat VERSION.txt)"
  # check to make sure the tag doesn't already exist
  if ! git rev-parse $VERSION_TAG >/dev/null 2>&1; then
    echo "Using the most recent tag: $VERSION_TAG and creating a latest-release branch"
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"
    set +x
    git remote add deploy-latest-release https://"${GH_TOKEN}"@github.com/alphagov/govuk_prototype_kit.git > /dev/null 2>&1
    set -x
    # check the remote has been added
    git checkout -b latest-release v"$VERSION_TAG"
    git push --force deploy-latest-release latest-release
    echo "Pushed latest-release branch to GitHub"
  else
    echo "Not updating the latest-release branch as the tag already exists..."
  fi
else
  echo "Not updating the latest-release branch as we're on a branch..."
fi
