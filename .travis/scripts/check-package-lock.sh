# Check for uncommitted changes to package-lock.json on Travis
# 
# When Travis runs `npm install` it should not result in changes to
# package-lock.json – if there are changes then the two are out of sync.

if git diff --exit-code --quiet package-lock.json; then
  echo "package-lock.json is up to date"
else
  echo "package-lock.json is out of sync with package.json." \
       "Ensure you have run npm install and committed changes to package-lock.json"
  exit 1
fi
