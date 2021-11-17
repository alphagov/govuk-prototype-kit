#!/usr/bin/env bash

# Use unofficial bash strict mode
set -euo pipefail

msg () {
	# shellcheck disable=SC2048,2086 # we want to expand words to allow -n flag
	1>&2 echo $*
}

# Set global vars ARCHIVE_FILE ARCHIVE_ROOT
get_archive_vars () {
	# choose the archive file with the largest version number, use this to update from
	ARCHIVE_FILE="$(find . -name 'govuk-prototype-kit*.zip' -exec basename '{}' ';' | sort -V | tail -n1)"
	ARCHIVE_ROOT="${ARCHIVE_FILE//.zip}"
}

# Hide update folder from git
update_gitignore () {
	cd update

	if [[ -f .gitignore ]]; then
		cp .gitignore .gitignore.bak
	fi

	echo '*' > .gitignore

	cd ..
}

# Check whether it is safe for the script to run
check () {
	if ! grep -q '"govuk-prototype-kit"' package.json 2> /dev/null; then
		msg 'ERROR you must run update.sh in a folder containing a GOV.UK Prototype Kit installation'
		msg 'Exiting'
		exit 1
	fi
}

# Lay the ground work
prepare () {
	# Clean any old update folder, in case the script has been run before and the
	# user did not remove the old update files. If for some reason cleaning is
	# not desired, run with envvar CLEAN=0.
	CLEAN="${CLEAN:-1}"

	if [[ "$CLEAN" -eq 1 ]]; then
		rm -rf update
	fi

	# make the update folder
	mkdir -p update
	update_gitignore
}

# Download the latest Prototype Kit release archive to the update folder
fetch () {
	cd update

	if ! ls govuk-prototype-kit*.zip > /dev/null 2>&1; then
		msg 'Downloading latest version of GOV.UK Prototye Kit...'
		curl -LJO https://govuk-prototype-kit.herokuapp.com/docs/download
		msg 'Done'
	fi

	cd ..
}

# Extract the downloaded release archive into the update folder
extract () {
	get_archive_vars

	cd update

	# unzip the release archive into the 'update' folder
	if [ ! -d "$ARCHIVE_ROOT" ]; then
		msg -n 'Extracting latest files and folders into update folder...'
		unzip -qn "$ARCHIVE_FILE"
		msg 'Done'
	fi

	cd ..
}

# Copy 'core files' from the update folder into the current prototype folder
copy () {
	get_archive_vars

	OLD_VERSION="$(cat VERSION.txt)"
	NEW_VERSION="$(cat update/"$ARCHIVE_ROOT"/VERSION.txt)"

	# remove node_modules folder to ensure new packages will be installed cleanly
	rm -rf node_modules

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

	update_gitignore
}

if [ "$0" == "${BASH_SOURCE[0]}" ]
then
	check
	prepare
	fetch
	extract
	copy
fi
