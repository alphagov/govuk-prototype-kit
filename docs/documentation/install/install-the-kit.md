# Install the kit

## Download the kit as a zip

The simplest way to get the kit is to <a href="/docs/download" data-link="download">download it as a zip</a>. You'll use a new copy of the kit for each new prototype you make. That way your prototypes don’t interfere with each other.

### Decide where you want to keep your prototypes

We recommend keeping all your prototypes in one folder called `projects`.

#### Mac users

Create a folder called `projects` in your home folder. You can open your home folder by opening a new finder window, and selecting `go > home` from the top menu.

![Screenshot of a 'projects' folder in the mac home folder](/public/images/docs/mac-home-folder-projects.png)

#### Windows users

Create a folder called `projects` in your `Documents` folder.

### Unzip the kit and move it

Unzip the kit you downloaded - you should end up with a folder called `govuk-prototype-kit` followed by the version number.

Rename the folder to something descriptive for your prototype. For this guide, we’ll use `juggling-licence-prototype`.

Move the folder into your `projects` folder.

## Terminal basics

The terminal (on mac and linux, git bash on windows) lets you type in commands and run programs on your computer. You can also use it to browse your file system - to open folders, etc.

Learning a few basic terminal commands can make using the kit much easier.

* [Tutorial on using terminal (mac)](http://mac.appstorm.net/how-to/utilities-how-to/how-to-use-terminal-the-basics/)
* [Tutorial on using git bash (windows)](https://openhatch.org/missions/windows-setup/open-git-bash-prompt)

### Navigating to your prototype

You need to navigate to your prototype in the terminal. Most commands for the kit need to be run in the prototype folder.

#### Mac users:
```
cd ~/projects/juggling-licence-prototype
```

#### Windows users:
```
cd ~/Documents/projects/juggling-licence-prototype
```

## Install the kit

### Install modules

You need to download extra code used by the kit before it can run. You can get this by running:
```
npm install
```
The install may take up to a minute. Whilst installing it may `WARN` about some items - this is ok. As long as there are no `ERROR`s you can continue.


<a href="run-the-kit.md" class="button">Next (run the kit)</a>
