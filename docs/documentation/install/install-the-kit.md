# Install the kit

## Download the kit as a zip

The simplest way to get the kit is to [download it as a zip](/prototype-admin/download-latest). You'll use a new copy of the kit for each new prototype you make. That way your prototypes don’t interfere with each other.

### Decide where you want to keep your prototypes

We recommend keeping all your prototypes in one folder called `projects`.

#### Mac users

Create a folder called `projects` in your home folder. You can open your home folder by opening a new finder window, and selecting `go > home` from the top menu.

![Screenshot of a 'projects' folder in the mac home folder](/public/images/docs/mac-home-folder-projects.png)

#### Windows users

Create a folder called `projects` in your `Documents` or `My Documents` folder.

### Unzip the kit

Unzip the kit you downloaded - you should end up with a folder called `govuk_prototype_kit-3.0.0`

### Rename the kit

Rename the folder to something descriptive for your prototype. For this guide, we’ll use `juggling-licence-prototype`.

### Move the kit in to projects folder

Move the kit in to your newly created `projects` folder.

## Terminal basics

The terminal (terminal on mac and linux, git bash on windows) lets you type in commands and run programs on your computer. You can also use it to browse your file system - to open folders, etc.

Learning a few basic terminal commands can make using the kit much easier.

* [Tutorial on using terminal (mac)](http://mac.appstorm.net/how-to/utilities-how-to/how-to-use-terminal-the-basics/)
* [Tutorial on using git bash (windows)](https://openhatch.org/missions/windows-setup/open-git-bash-prompt)

### Navigating to your prototype

You need to be able to navigate to your prototype from the terminal. Most commands for the kit need to be run from the prototype folder.

#### Mac users:
```
cd ~/projects/juggling-licence-prototype
```

#### Windows users:

Navigating will depend on whether you have a `Documents` or a `My Documents` folder.

Documents:
```
cd ~/Documents/projects/juggling-licence-prototype
```
My Documents:
```
cd ~/My\ Documents/projects/juggling-licence-prototype
```

#### Returning to this folder

It’s important that you be able to navigate to your prototype in the terminal - most commands will need to be run from the prototype folder.

To check you’re in the right folder, you can run `ls` (list items):
```
ls
```
You should see a list of files inside the prototype, starting with `CHANGELOG.md, CONTRIBUTING.md, gulpfile.js etc`

> If you don’t see these files, check that you installed the kit into the right location and named it correctly.

## Install the kit

### Open a terminal window

If you don’t already have one open, open a terminal window and navigate to your prototype folder.

### Install modules

You need to download extra code used by the kit before it can run. You can get this by running:
```
npm install
```
The install may take up to a minute. Whilst installing it may `WARN` about some items - this is ok. As long as there are no `ERROR`s you can continue.


<a href="run-the-kit.md" class="button">Next (run the kit)</a>
