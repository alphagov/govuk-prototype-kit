---
title: Update your Prototype Kit
---
# Update your Prototype Kit

How to update your prototype and get help from the GOV.UK Prototype Kit team.

To get security patches and new features, make sure you update to the latest version of the Prototype Kit.

## Get help

If you have a question or need help with updating the Prototype Kit, you can:

- email govuk-design-system-support@digital.cabinet-office.gov.uk
- get in touch on the [Prototype Kit's channel on cross-government Slack](https://ukgovernmentdigital.slack.com/messages/prototype-kit/)

Tell us as much as you can about the issue you're having, and the computer and operating system you're using.

## Updating to the latest version

### Find what version you’re using

In Finder on Mac or Windows Explorer, go to your prototype folder and open the file `VERSION.txt`. This will show what version of the Prototype Kit you’re using.

- If your prototype is version 8 or before, then contact the GOV.UK Prototype team for help with updating it
- If your prototype is version 9, 10, 11 or 12, you can update to the latest version by following the steps on this page

### Updating to the latest version

1. Make a backup of your prototype folder. You can do this in Finder or Windows Explorer. This may take a few minutes.

2. In the [terminal](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md#terminal), `cd` to your prototype folder.

3. Run this command:

```
curl -L https://govuk-prototype-kit.herokuapp.com/docs/update.sh | bash
```

It will download a zip file and unzip the latest version of the Prototype Kit into a new `update` folder.

4. In a code editor (like Atom) open the file at `update/app/assets/sass/application.scss`.

5. Copy everything until the line that starts with `// Add extra styles here`.

6. Open the file at `app/assets/sass/application.scss`. This is the file in your prototype folder, not the one in the update folder.

7. Delete everything above `// Add extra styles` here and paste what you copied in step 5. Save the file.

8. In your terminal, run `npm install`. This may take up to a minute. You can ignore any lines in the log that start with `WARN`.

9. In your terminal, run `npm start`.

10. Check your prototype to see if it works as expected.

11. Delete the update folder in Finder or Windows Explorer.

### If your prototype does not work

If your prototype does not work, compare the new `package.json` file to the `package.json` file in the backup you made in step 3.

Run `npm install PACKAGE-NAME` for each package that's missing in the new file.

## Gulp error message

If you use a GDS managed device, you no longer have permission to run Gulp (a JavaScript toolkit used by Prototype Kit). We’ve updated the Prototype Kit so if you install it now, it runs Gulp without having to install it separately.

If you want to run an existing prototype made before July 2021, you may see an error message about not having permission to run Gulp.

To fix this:

1. open a code editor, like Atom
2. from your prototype project folder, open the ‘start.js’ file
3. go to the line that starts with: `var gulp = spawn`
4. replace the entire line with:

`var gulp = spawn ('node', ['./node_modules/gulp/bin/gulp.js', '--log-level', '-L'])`

5. save the file

If you need to restart the Prototype Kit after the fix:

1. in your [terminal](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md#terminal), `cd` to your prototype folder
2. run `npm start`
