# Install the kit

## Download the kit as a zip

The simplest way to get the kit is to <a href="/docs/download" data-link="download">download it as a zip</a>.

You'll use a new copy of the kit for each new prototype you make. That way your prototypes don’t interfere with each other.

Make sure you are installing the kit on a local drive. Do not install the kit on a cloud-based drive (for example, Dropbox, Microsoft OneDrive), as this may cause permissions issues.

### Make a folder for your prototypes

We recommend keeping all your prototypes in one folder called `prototypes`.

Create a folder called `prototypes` in your `Documents` folder.

### Unzip the kit and move it

Unzip the kit you downloaded - you should end up with a folder called `govuk-prototype-kit` followed by the version number.

Rename the folder to something descriptive for your prototype. For this guide, we’ll use `juggling-licence`.

Move the folder into your `prototypes` folder.

## Terminal basics

The terminal on MacOS and Linux (and Git Bash on Windows, which is part of Git for Windows) lets you type in commands and run programs on your computer. 

The important thing to remember about the terminal is that you‘re working in one directory (folder) at any one time.

There are a few commands you‘ll have to run in the terminal to use the Prototype Kit.

### Commands

* `cd [name of directory]`  = change to [name of directory]
* `cd ~`  = go to your home directory
* `ls` = list all the folders and files in a directory
* `pwd` = print working directory tells you what directory you’re in 
* press up and down on the keyboard to go through previous commands
* `npm start`  = start the Prototype Kit (you need to be in your prototype folder) 

To quit the kit, in the terminal press the <b>ctrl</b> and <b>c</b> keys together.

If you type a command that the terminal does not understand, it will show you an error message. Do not worry if you see one of these. Have a look at the command you wrote and see if there is a typo in the command.

You can follow a [tutorial on basic terminal commands](https://tutorials.codebar.io/command-line/introduction/tutorial.html) on the codebar website.

### Navigating to your prototype folder

You need to navigate to your prototype folder in the terminal. Most commands for the kit need to be run in the prototype folder.

```
cd ~/Documents/prototypes/juggling-licence
```

Take note of what is upper or lower case - for example lower case 'd' for 'Documents' will not work.

If any of your folder names contain spaces, you must add quotation marks around everything after `~/`. For example:

```
cd ~/"a folder name with spaces/Documents/prototypes/juggling-licence"
```

## Install modules

You need to download extra code used by the kit before it can run. You only need to run this command the first time you start or download a prototype:

```
npm install
```
The install may take about a minute. Whilst installing, it may `WARN` about some items - this is ok. As long as there are no `ERROR`s, you can continue.


<a href="run-the-kit.md" class="button">Next (run the kit)</a>
