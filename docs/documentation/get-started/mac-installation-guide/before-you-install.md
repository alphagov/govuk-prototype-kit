# Before you install the Prototype Kit

> In some departments, you need admin access on your computer to install the Prototype Kit. If you do not have admin access, you can ask your IT team to install it for you.

Before you install the Prototype Kit, you will need:

- [an application called Terminal](#terminal)
- [some free software called Node.js](#node.js)
- [an code editor like Atom or Visual Studio Code](#html-text-editor)
- [command line tools](command-line-tools)

This guide explains how to get these set up so you can install and use the Prototype Kit.

## Terminal

You need to use an application called Terminal which comes preinstalled on your computer.

The quickest way to find it is to select the magnifying glass icon in the top right of your screen to open Spotlight search and type 'terminal'.

Alternatively, go to your Applications folder and open Utilities. Select Terminal from the list of applications.

This guide will give you some commands to enter into Terminal, like this.

`Here is an example command`

When it does, either type or paste the command into Terminal and press enter.

## Node.js

To use the Prototype Kit, you will need to use at least version 10 of a piece of free software called Node.js.

### Check if you have Node.js already

To find out if you already have Node.js installed, enter this command into Terminal.

`node --version`

If you do not have Node.js installed at all, it will say 'command not found' and you need to install Node.js.

If you have Node.js already, Terminal will give you a version number, like v10.15.1.

If the version number starts with 10, you have the correct version installed.

If the version number is lower than 10, like v.0.12.0 or v.5.0.0, you need to install a newer version of Node.js.

### If you need to install Node.js

You can download and install Node.js from the [Node.js website](https://nodejs.org/en/).

Choose the version marked LTS, which stands for long term support, and follow the installation instructions.

Once you have installed Node.js, quit and restart Terminal. To check it's installed correctly, enter the following command again.

`node --version`

If it’s installed correctly, Terminal will now show a version number starting with 10.

## Code editor

You will need to download an code editor to work on your prototype.

There are a number of free code editors to choose from, like [Atom](https://atom.io/) or [Visual Studio Code](https://code.visualstudio.com/).

## Command line tools

The last thing you’ll need before you can install the kit is command line tools. In Terminal, enter this command.

`xcode-select --install`

If you already have command line tools, Terminal will say `xcode-select: error: command line tools are already installed use "Software Update" to install updates.`

If you do not have command line tools, an installer will open. 

<img class="bordered" src="/public/images/docs/command-line-tools-installer.png" alt="Command line tools installation pop up">

Select the install option and follow the instructions.

**[Next install the Prototype Kit](/docs/get-started/mac-installation-guide/install-the-kit)**
