#!/usr/bin/env bash

# Use unofficial bash strict mode
set -euo pipefail

msg () {
	# shellcheck disable=SC2048,2086 # we want to expand words to allow -n flag
	1>&2 echo $*
}

# check that we are in a prototype
if ! grep -q govuk-prototype-kit package.json 2> /dev/null; then
	msg 'ERROR you must run update.sh in a folder containing a GOV.UK Prototype Kit installation'
	msg 'Exiting'
	exit 1
fi

OLD_VERSION="$(cat VERSION.txt)"

# make the update folder
mkdir -p update
# stop git from committing the update folder
echo '*' > update/.gitignore

# download the latest Prototype Kit release archive to the update folder
cd update

if ! ls govuk-prototype-kit*.zip > /dev/null 2>&1; then
  msg 'Downloading latest version of GOV.UK Prototye Kit...'
  curl -LJO https://govuk-prototype-kit.herokuapp.com/docs/download
  msg 'Done'
fi

# choose the archive file with the largest version number, use this to update from
ARCHIVE_FILE="$(find . -name 'govuk-prototype-kit*.zip' | sort -V | tail -n1)"
ARCHIVE_ROOT="${ARCHIVE_FILE//.zip}"
NEW_VERSION="${ARCHIVE_ROOT#govuk-prototype-kit-}"

# unzip the release archive into the 'update' folder
if [ ! -d "$ARCHIVE_ROOT" ]; then
  msg -n 'Extracting latest files and folders into update folder...'
  unzip -qn "$ARCHIVE_FILE"
  msg 'Done'
fi

# Go back to the prototype folder
cd ..

# remove node_modules folder to ensure new packages will be installed cleanly
rm -rf node_modules

# copy from the update folder into the current prototype folder
msg -n 'Updating your prototype files... '

{
  echo "Updating from $OLD_VERSION to $NEW_VERSION"

  # Replace core folders, making sure to remove any old files
  rm -rvf docs gulp lib
  cp -Rv "update/$ARCHIVE_ROOT/docs" "update/$ARCHIVE_ROOT/gulp" "update/$ARCHIVE_ROOT/lib" .

  # Update core files (copy only the files in the update folder, not files in app/)
  find "update/$ARCHIVE_ROOT" -type f -depth 1 -print0 | xargs -0 -I % cp -v % .

  # specific workaround for old step 9, yuck
  cp -Rv "update/$ARCHIVE_ROOT/app/assets/sass/patterns" "app/assets/sass/"

  echo "Done"
} >> update/update.log

msg 'Done'

msg
msg "Your prototype kit files have now been updated, from ${OLD_VERSION} to ${NEW_VERSION}."
msg 'There are still some configuration changes needed, please follow the steps at'
msg 'https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit'
msg "to complete the update. You can find the files for the new version at \`update/${ARCHIVE_ROOT}\`."
msg
