# Updating to the latest version

1. Make a backup copy of your prototype folder.

2. In your prototype, delete everything except the `app` and `.git` folders.

   You may not be able to see the `.git` folder because files and folders that start with `.` are hidden by default.

3. [Download the zip file of the latest version of the Prototype Kit](/docs/download).
  
4. Unzip the zip file.
 
5. Copy all the folders except the `app` folder to your prototype.

6. Replace the `app/config.js` file in your prototype with the `app/config.js` file from the unzipped folder.

7. Compare your new `config.js` file to the `config.js` file in the backup you made in step 1, and copy over anything you need to - for example your service name.

8. Copy the `app/assets/sass/patterns` from the unzipped folder to your prototype.

9. Copy the `app/assets/sass/components` from the unzipped folder to your prototype.

10. Open the `app/assets/sass/application.scss` from the unzipped folder in the unzipped folder.

10. Copy everything down to `// Add extra styles here`, then paste it above `// Add extra styles here` in the `app/assets/sass/application.scss` file in your prototype.

11. Check the [latest Prototype Kit release note](https://github.com/alphagov/govuk-prototype-kit/releases/latest) and follow any guidance on updating your protoype.

12. In your [terminal](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md#terminal), `cd` to your prototype folder.

13. Run `npm install`.

    This may take up to a minute. You can ignore any lines in the log that start with `WARN`.

14. [Run the kit and check it works](/docs/install/run-the-kit).

## Get help

You can:

- [raise an issue in the Prototype Kit GitHub repo](https://github.com/alphagov/govuk-prototype-kit/issues)
- get in touch using the [#prototype-kit channel on cross-government Slack](https://ukgovernmentdigital.slack.com/messages/prototype-kit/)

Tell us as much as you can about the issue you're having, and the computer and operating system you're using.
