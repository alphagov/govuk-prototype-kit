# Requirements

The GOV.UK Prototype Kit runs on Mac, Windows and Linux. At a minimum you’ll need Node.js (install instructions below) and a web browser.

If you're using an M1 Mac ([certain Macs launched in 2020 and later](https://en.wikipedia.org/wiki/Apple_M1#Products_that_include_the_Apple_M1)), you might experience issues when you run the Prototype Kit. To get support, please [contact the Design System team](https://design-system.service.gov.uk/get-in-touch/).

## Software you need

You'll usually need admin access to your machine to install the software.

If you do not have admin access, ask your IT team to install the software for you.

GDS staff can install the software themselves with the Self Service app.

You'll need:

* Node.js 14.x.x
* Git Bash (if you're using Windows, see below)

## Terminal

You'll need a terminal application to install, start and stop the kit. Using a terminal is sometimes called ‘using the command line’.

### Mac users

Macs come with `Terminal.app`. It’s located in the `Utilities` folder in the `Applications` folder. You can also find it using spotlight (magnifying glass icon in the top right) and typing 'terminal'.

### Windows users

This guide will use `Git Bash` as a terminal instead of the existing `CMD` application. Git Bash is more fully featured and uses the same commands as Mac and Linux, so instructions in this guide work for all.

Installing `Git Bash` installs two things for you: a terminal (for entering commands), and Git (used later to share your work with others).

#### Installing Git Bash

Download [Git Bash (direct download)](https://git-scm.com/download/win).

Install with all the default options.

### Entering commands in the terminal

Commands to be entered in to the terminal will be inset like this:
```
command to be typed in to terminal
```
Once you’ve typed the command, press enter to run it.


## Node.js version 14 LTS

The kit is designed to work with Node.js version 14 LTS. The kit works with any 14.x.x version.

### Check if you have Node.js

In terminal (Git Bash in Windows):
```
node --version
```
If it says `command not found` or `Error 0x2 starting node.exe --version` you don’t have Node and will need to download and install it.

If the version number starts with 14 you have the correct version installed.

If it says another number such as `0.12` or `5.x.x`, you need to download and install version 14.

### Download and install Node.js

#### Mac / Windows users

[Download version 14 from the Node.js website.](https://nodejs.org/en/)

Run the installer with all default options.

#### Linux users

[Follow the Linux instructions on the Node.js. website.](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) Make sure you get version 14.

### Once Node is installed

You’ll need to quit and restart the terminal to be able to use Node for the first time.

To check it is installed correctly you can again run:
```
node --version
```

If it’s installed correctly it should show a number starting with 14.

<a href="install-the-kit.md" class="button">Next (install the kit)</a>
