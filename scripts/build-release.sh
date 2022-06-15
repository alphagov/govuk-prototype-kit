#!/bin/bash

set -e

REF="${1:-main}"

VERSION="$(git show "${REF}":VERSION.txt)"
NAME="govuk-prototype-kit-${VERSION}"

echo "Creating release archive for code in ${REF}"

INIT_CWD="$(pwd)"
WORKDIR="$(mktemp -d -t govuk-prototype-kit--release-"${VERSION}")"

echo
echo "Switching to workdir $WORKDIR"

# start by copying release files to the tmpdir
git archive --format=tar --prefix="${NAME}/" main | tar -C "$WORKDIR" -xf -

# we now want to remove all the optional/dev dependencies from the package
cd "$WORKDIR/$NAME"

sed -i '' -e '/^  "optionalDependencies"/,/^  }/d' package.json
npm install

# we can now create the actual release archive
# making sure not to include the node_modules folder
cd ..
zip --exclude "${NAME}/node_modules/*" -r "${NAME}.zip" "${NAME}"

# move archive to cwd and clean up
cd "$INIT_CWD"
mv "$WORKDIR/${NAME}.zip" .

echo
echo "Saved release archive to ${NAME}.zip"

rm -rf "$WORKDIR"
