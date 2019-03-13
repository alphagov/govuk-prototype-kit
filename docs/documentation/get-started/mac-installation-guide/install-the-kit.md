# 2. Install the Prototype Kit on Mac

This guide explains how to download and install the Prototype Kit. 

You need a few things set up before you can install the Prototype Kit, like Terminal and Node.js. If you haven’t already, start by reading [what to do before installing the Prototype Kit](/docs/get-started/mac-installation-guide/before-you-start). 

When you are ready to install it, [download the Prototype Kit as a zip (the download will start straight away when you select this link)](/docs/download). 

Do not open it straight away, as you need to create a folder to put it in. 

Go to your Home folder by opening Finder, and selecting “Go” and then “Home” from the menu at the top of your screen. 

![Screenshot of the Go menu on Mac, including the Home option](/public/images/docs/go-home-menu-screenshot.png)

Create a folder called “projects” in your Home folder. 

You can now open the Prototype Kit zip file you downloaded. When you’ve done this, you should see a folder called govuk-prototype-kit followed by the version number.

Rename the folder to something that describes your prototype and then move it into your projects folder.

Open Terminal and go to your prototype folder by entering `cd ~/projects/` followed by the name of your prototype, like this.

`cd ~/projects/name-of-your-prototype`.

Now, enter the following command to install the Prototype Kit.

`npm install`

The install can take up to a minute. Whilst it’s installing, you may see some warnings. 

**[ADD SCREENSHOT OF WARNINGS]**

This is OK, and you do not need to do anything unless you also get an error, which looks something like this.

**[ADD SCREENSHOT OF ERRORS]**

If you do get an error, you can ask for help on the [#prototype-kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit) channel on cross-government Slack or email govuk-design-system-support@digital.cabinet-office.gov.uk.

If you do not get an error, you’re ready to [start running the Prototype Kit](/docs/get-started/mac-installation-guide/start-and-stop-the-kit). 
