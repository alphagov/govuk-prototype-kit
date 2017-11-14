# Requirements

The kit runs on Mac, Windows and Linux. At a minimum you’ll need `node.js` (install instructions below) and a web browser.

This guide recommends additional software which will be used in later guides.

## Admin access

If you have admin access to your machine, you can follow this guide to install the required software.

If you do not have admin access, ask your computer administrator to install:
* Node.js 8.x.x
* Atom (text editor)
* Command line tools (Mac)
* Git bash (Windows)

## Terminal

You'll need a terminal application to install, start and stop the kit. Using a terminal is sometimes called ‘using the command line’.

### Mac users

Macs come with `Terminal.app`. It’s located in the `Utilities` folder in the `Applications` folder. You can also find it using spotlight (magnifying glass icon in the top right) and typing 'terminal'.

### Windows users

This guide will use `Git Bash` as a terminal instead of the existing `CMD` application. Git Bash is more fully featured and uses the same commands as Mac and Linux, so instructions in this guide work for all.

Installing `git bash` installs two things for you: a terminal (for entering commands), and git (used later to share your work with others).

#### Installing git bash

Download [Git bash (direct download)](https://git-scm.com/download/win).

Install with all default options.

### Entering commands in the terminal

Commands to be entered in to the terminal will be inset like this:
```
command to be typed in to terminal
```
Once you’ve typed the command, press enter to send it.


## Node.js version 8 LTS

The kit is designed to work with Node.js version 8 LTS. The kit works with any 8.x.x version.

### Check if you have Node.js

In terminal (git bash in Windows):
```
node --version
```
If it says `command not found` or `Error 0x2 starting node.exe --version` you don’t have node and will need to download and install it.

If the version number starts with 8 you have the correct version installed.

If it says another number such as `0.12` or `5.x.x`, you need to download and install version 8.

### Download and install Node.js

#### Mac / Windows users

Download version 8 from [nodejs.org](https://nodejs.org/en/).

Run the installer with all default options.

#### Linux users

Follow the instructions on the [Node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
) site. Make sure you get version 8, not 9.

### Once Node is installed

You’ll need to quit and restart the terminal to be able to use Node for the first time.

To check it is installed correctly you can again run:
```
node --version
```

If it’s installed correctly it should show a number starting with 8.

## Atom (text editor)

You’ll need a text editor to edit and make changes to your prototype. We recommend [Atom](https://atom.io/) - which is free and has lots of useful features.

## Command line tools (mac)

Mac users will need the OSx Command line tools.

In terminal:
```
xcode-select --install
```
If you already have command line tools, this will display `xcode-select: error: command line tools are already installed, use "Software Update" to install updates`.

![Screenshot of Command line tools popup message](/public/images/docs/installing-mavericks-popup.png)

If you don’t have command line tools, it will open an installer. Follow the instructions to install the command line tools.

<a href="install-the-kit.md" class="button">Next (install the kit)</a>
