# Install the Prototype Kit

This guide explains how to download and install the Prototype Kit on Windows.

> You need a few things set up before you can install the Prototype Kit, like Git Bash and Node.js. If you haven’t already, start by reading [what to do before installing the Prototype Kit](/docs/install/windows-installation-guide/before-you-install).

When you are ready to install it, [download the Prototype Kit as a zip (the download will start straight away when you select this link)](/docs/download).

Do not open it straight away, as you need to create a folder to put it in.

Go to your Documents folder and create a folder called “projects”.

You can now open the Prototype Kit zip file you downloaded. When you’ve done this, you should see a folder called govuk-prototype-kit-for-upload.

Rename the folder to something that describes your prototype. If your name consists of more than one word, separate words with hyphens. Move it into your projects folder.

Open Git Bash and go to your prototype folder by entering `cd ~/Documents/projects/` followed by the name of your prototype, like this.

`cd ~/Documents/projects/name-of-your-prototype`

Now, enter the following command to install the Prototype Kit.

`npm install`

The install can take up to a minute. Whilst it’s installing, you may see some warnings.

![npm install warnings in the terminal](/public/images/docs/npm-install-warn-git-bash-windows.png)

This is OK, and you do not need to do anything unless you also get an error, which looks something like this.

![npm install errors in the terminal](/public/images/docs/npm-install-error-git-bash-windows.png)

**[Next start running the Prototype Kit](/docs/get-started/windows-installation-guide/start-and-stop-the-kit)**
