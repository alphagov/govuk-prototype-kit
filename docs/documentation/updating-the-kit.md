# Updating to the latest version

1. [Download the zip file of the latest version of the Prototype Kit](/docs/download).

2. Unzip the zip file. It will make a folder called `govuk-prototype-kit`, with a version number.

3. Make a backup copy of your prototype folder.

4. You’ll need to copy some files that operating systems do not usually show. These hidden files usually start with a `.` and are known as ‘dot files’. You can:
- [show hidden files in Windows](https://support.microsoft.com/en-us/windows/view-hidden-files-and-folders-in-windows-97fbc472-c603-9d90-91d0-1166d1d9f4b5)
- show hidden files on MacOS by pressing command + shift + . in Finder 

5. In your prototype folder, delete everything except the `app` and `.git` folders.

6. Copy all the files and folders except the `app` folder from the `govuk-prototype-kit` folder to your prototype.

7. Replace the `app/config.js` file in your prototype with the `app/config.js` file from the `govuk-prototype-kit` folder.

8. Compare your new `config.js` file to the `config.js` file in the backup you made in step 3, and copy over anything you need to from the backup - for example your service name.

9. Copy `app/assets/sass/patterns` from the `govuk-prototype-kit` folder to your prototype.

10. Open the `app/assets/sass/application.scss` file in the `govuk-prototype-kit` folder.

11. Copy everything down to `// Add extra styles here`, then paste it into the `app/assets/sass/application.scss` file in your prototype so it replaces everything above `// Add extra styles here`.

12. Save the updated `app/assets/sass/application.scss` file in your prototype.

13. Check the [latest Prototype Kit release note](https://github.com/alphagov/govuk-prototype-kit/releases/latest) and follow any guidance on updating your prototype.

    If your prototype has not been updated for a long time, you should also follow any guidance in [release notes](https://github.com/alphagov/govuk-prototype-kit/releases) between the version you're updating from and the latest version. You can find out the version you're updating from in the `VERSION.txt` file in your backup folder.

14. In your [terminal](/docs/install/requirements.md#terminal), `cd` to your prototype folder.

15. Run `npm install`.

    This may take up to a minute. You can ignore any lines in the log that start with `WARN`.

16. [Run the kit and check it works](/docs/install/run-the-kit).

If your prototype does not work, compare the new `package.json` file to the `package.json` file in the backup you made in step 3. Run `npm install PACKAGE-NAME` for each package that's missing in the new file.

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

## Get help

You can:

- [raise an issue in the Prototype Kit GitHub repo](https://github.com/alphagov/govuk-prototype-kit/issues)
- get in touch using the [#prototype-kit channel on cross-government Slack](https://ukgovernmentdigital.slack.com/messages/prototype-kit/)

Tell us as much as you can about the issue you're having, and the computer and operating system you're using.
