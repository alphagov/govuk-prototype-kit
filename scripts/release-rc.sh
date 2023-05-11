#!/bin/bash

set -e

branch=$1
version=$2
currentBranch=$(git branch --show-current)

if [ $# != 2 ]; then
  echo 1>&2 ""
  echo 1>&2 "Please specify a branch and a release version for example:"
  echo 1>&2 ""
  echo 1>&2 "$0 my-branch 13.0.0-rc.0"
  echo 1>&2 ""
  exit 2
fi

if [[ "$version" != *"-rc."* ]]; then
  echo 1>&2 ""
  echo 1>&2 "release candidates must include '-rc.' for example:"
  echo 1>&2 ""
  echo 1>&2 "$0 my-branch 13.0.0-rc.0"
  echo 1>&2 ""
  exit 2
fi

if [[ $(git status --porcelain | wc -l) -gt 0 ]]; then
  echo 1>&2 ""
  echo 1>&2 "You have changes, please commit or stash before running the script."
  echo 1>&2 ""
  exit 2
fi

set -x

git checkout -b release-$version
git fetch
git reset --hard origin/$branch
npm version $version
git push -u origin release-$version
npm login
npm run clean-publish -- --tag snapshot
npm logout
git checkout $currentBranch > /dev/null
