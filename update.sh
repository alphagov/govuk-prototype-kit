#!/usr/bin/env bash

# Set the version of the kit that should be downloaded by default
# Update this when making a new release
VERSION="${VERSION:-12.1.1}"

# Use unofficial bash strict mode
set -euo pipefail

msg () {
	# shellcheck disable=SC2048,2086 # we want to expand words to allow -n flag
	1>&2 echo $*
}

abspath () {
	# From https://stackoverflow.com/questions/3572030/bash-script-absolute-path-with-os-x
	[[ "$1" = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

# Set global vars ARCHIVE_FILE ARCHIVE_ROOT
get_archive_vars () {
	if [ -z "${ARCHIVE_FILE:-}" ]; then
		ARCHIVE_FILE="update/govuk-prototype-kit-${VERSION}.zip"
	fi
	if [ ! -z "${ARCHIVE_FILE:-}" ]; then
		ARCHIVE_FILE="$(abspath $ARCHIVE_FILE)"
		ARCHIVE_NAME="$(basename "$ARCHIVE_FILE")"
		ARCHIVE_ROOT="${ARCHIVE_NAME//.zip}"
	fi
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
	if ! grep -q '"govuk-prototype-kit"\|"express-prototype"' package.json 2> /dev/null; then
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
	get_archive_vars

	# If archive file already exists do nothing
	if [ -f "$ARCHIVE_FILE" ]; then
		return
	fi

	cd update

	msg "Downloading version ${VERSION} of GOV.UK Prototype Kit..."
	curl -fLJO "https://github.com/alphagov/govuk-prototype-kit/releases/download/v${VERSION}/${ARCHIVE_NAME}" \
		|| { msg 'ERROR: could not download update'; exit 1; }
	msg 'Done'

	cd ..
}

# Extract the downloaded release archive into the update folder
extract () {
	get_archive_vars

	cd update

	msg -n 'Extracting latest files and folders into update folder...'

	unzip -qn "$ARCHIVE_FILE"

	shopt -s dotglob
	mv "$ARCHIVE_ROOT"/* .
	rm -d "$ARCHIVE_ROOT"

	msg 'Done'

	cd ..
}

pre () {
	if [ -f 'update/lib/_update/pre.js' ]; then
		node 'update/lib/_update/pre'
	fi
}

# Copy 'core files' from the update folder into the current prototype folder
copy () {
	OLD_VERSION="$(cat VERSION.txt)"
	NEW_VERSION="$(cat update/VERSION.txt)"

	# remove node_modules folder to ensure new packages will be installed cleanly
	rm -rf node_modules

	# if there are any errors we want there to be a clear error message for users
	function catch_errors {
		set +x
		# Echoes to fd 3 to avoid being caught by redirection to update.log. See comment below.
		1>&3 echo 'ERROR'
		1>&3 echo
		1>&3 tail -n 3 < update/update.log
		1>&3 echo
		1>&3 echo 'There has been an error,  your prototype could not be updated.'
		1>&3 echo 'Your prototype kit files may be in an inconsistent state, please'
		1>&3 echo 'contact the GOV.UK Prototype Kit team for support.'
		exit 1
	}

	trap catch_errors ERR

	msg -n 'Updating your prototype files... '

	{
		echo "Updating from $OLD_VERSION to $NEW_VERSION"

		set -x

		# Replace core folders, making sure to remove any old files
		rm -rvf docs gulp lib gulpfile.js
		cp -Rv "update/docs" "update/lib" .
		[[ -e "update/gulp" ]] && cp -Rv update/gulp .

		# Update core files (copy only the files in the update folder, not files in app/)
		find "update" -maxdepth 1 \
			-type f \
			-not -name update.log \
			-not -name '*.zip' \
			-print0 \
		| xargs -0 -I % cp -v % .

		# copy any new patterns
		if [ -d "update/app/assets/sass/patterns" ]; then
		  cp -Rv "update/app/assets/sass/patterns" "app/assets/sass/"
		fi

		# copy unbranded layout - needed for the password page
		cp -v "update/app/views/layout_unbranded.html" "app/views/"

		set +x

		echo "Done"
	} >> update/update.log 3>&2 2>&1
	# The above line saves the output for all commands in the group, from both
	# stdout and stderr, into update.log, while still allowing the user to see the
	# error message from catch_errors. The correct order of runes was found by
	# trial and error.

	msg 'Done'

	trap - ERR

	update_gitignore
}

post () {
	if [ -f 'update/lib/_update/post.js' ]; then
		node 'update/lib/_update/post'
	fi
}

finish () {
	msg
	msg "Your prototype kit files have now been updated, from version ${OLD_VERSION} to ${NEW_VERSION}."
	msg 'If you need to make configuration changes, follow the steps at'
	msg 'https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit'
	msg "The files for the new version are at \`update\`."
	msg

	update_gitignore
}

if [ "$0" == "${BASH_SOURCE:-$0}" ]
then
	check
	prepare
	fetch
	extract
	copy
	post
	finish
fi
