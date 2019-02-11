#!/bin/bash
set -e

REPO_PATH='alphagov/govuk-prototype-kit'

echo "Add config for alphagov/$REPO_PATH"

git config --global user.name "Travis CI"
git config --global user.email "travis@travis-ci.org"
git remote add origin_ssh git@github.com:$REPO_PATH.git

# See `.travis/README.md` for more details
openssl aes-256-cbc -d -k $DEPLOY_KEY \
  -in .travis/prototype-kit-deploy-key.enc \
  -out ~/.ssh/id_rsa

chmod 600 ~/.ssh/id_rsa

echo "Check to see if the version file has been updated"

# Get the version from the version file
VERSION_TAG="v`cat VERSION.txt`"

# Create a new tag - if the version file has been updated and a tag for that
# version doesn't already exist

# Check to make sure the tag doesn't already exist
if ! git rev-parse $VERSION_TAG >/dev/null 2>&1; then
  echo "Creating new tag: $VERSION_TAG"

  # Create a new tag and push to Github
  git tag $VERSION_TAG
  git push origin_ssh $VERSION_TAG

  # This tag will trigger the builds for the deploy providers marked "# For tagged commits" in .travis.yml

  # Alias branch for the most recently released tag, for easier diffing
  # Force push local `master` branch to the `latest-release` branch on Github
  git push --force origin_ssh master:latest-release
  echo "Pushed latest-release branch to GitHub"

else
  echo "Not creating a new tag, or updating the latest-release branch as the tag already exists..."
fi
