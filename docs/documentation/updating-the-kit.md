# Updating to the latest version

You can update to the latest version of the GOV.UK Prototype Kit if you want to either:

- use a new component
- improve how your prototype meets accessibility requirements

You can update using either:

- Node.js package manager (npm)
- a zip file - if updating with npm does not work 

## Update using npm

1. In your [terminal](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md#terminal), `cd` to your prototype folder.

2. Run `npm update govuk-frontend`.

3. [Run the kit and check it works](/docs/install/run-the-kit).

If your prototype does not work or does not look right, try updating using a zip file instead.

## Update using a zip file

1. Make a backup copy of all your prototype's folders.

2. In your prototype, delete everything except the `app` and `.git` folders.

   You may not be able to see the `.git` folder because files and folders that start with `.` are hidden by default.

3. [Download the zip file of the latest version of the Prototype Kit](/docs/download).
  
4. Unzip the zip file.
 
5. Copy all the folders except the `app` folder to your prototype.

6. Copy the `app/config.js` file to the `app` folder of your prototype.

7. Compare your new `config.js` file to the `config.js` file in the backup you made in step 1, and copy over anything you need to - for example your service name.

8. Copy the `app/assets/sass/patterns` folder to your prototype.

9. Copy the `app/assets/sass/components` folder to your prototype.

10. Open the `app/assets/sass/application.scss` file in the unzipped folder.

10. Copy everything down to `// Add extra styles here`, then paste it above `// Add extra styles here` in the `app/assets/sass/application.scss` file in your prototype.

11. Check the [latest Prototype Kit release note](https://github.com/alphagov/govuk-prototype-kit/releases/latest) and follow any guidance on updating your protoype.

    If your version of the Prototype Kit was more than one version old, you'll need to check each release note since your version.

12. In your [terminal](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md#terminal), `cd` to your prototype folder.

13. Run `npm install`.

    This may take up to a minute. You can ignore any lines in the log that start with `WARN`.

14. [Run the kit and check it works](/docs/install/run-the-kit).

If your prototype does not work or does not look right, compare your files to the ones in the backup you made, and copy over anything you need to. Do not make any more changes to the files in the `app` folder.

## Get help

You can:

- [raise an issue in the Prototype Kit GitHub repo](https://github.com/alphagov/govuk-prototype-kit/issues)
- get in touch using the [#prototype-kit channel on cross-government Slack](https://ukgovernmentdigital.slack.com/messages/prototype-kit/)

Tell us as much as you can about the issue you're having, and the computer and operating system you're using.
