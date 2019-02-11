#!/bin/bash
set -e

# Check for the TRAVIS environment variable
if [[ -z "${TRAVIS}" ]]; then
  echo "⛔️ Refusing to run outside of Travis..."
  exit 1
fi

# Configure git...
git config --global user.name "Travis CI"
git config --global user.email "travis@travis-ci.org"
git remote add origin_ssh git@github.com:alphagov/govuk-prototype-kit.git

# Decrypt deploy key.
# 
# See `.travis/README.md` for more details
openssl aes-256-cbc -d -k $DEPLOY_KEY \
  -in .travis/prototype-kit-deploy-key.enc \
  -out ~/.ssh/id_rsa

chmod 600 ~/.ssh/id_rsa

# Get the version from the version file
VERSION_TAG="v`cat VERSION.txt`"

# Check that there's not a tag for the current version already
if ! git rev-parse $VERSION_TAG >/dev/null 2>&1; then
  # Create a new tag and push to GitHub.
  # 
  # GitHub will automatically create a release for the tag, ignoring any files
  # specified in the .gitattributes file
  echo "🏷 Creating new tag: $VERSION_TAG"
  git tag $VERSION_TAG
  git push origin_ssh $VERSION_TAG

  # Force push the latest-release branch to this commit
  echo "💨 Pushing latest-release branch to GitHub"
  git push --force origin_ssh master:latest-release
else
  echo "😴 Current version already exists as a tag on GitHub. Nothing to do."
fi
