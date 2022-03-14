---
title: Set up Git using the terminal
---
# Set up Git using the terminal

Git helps track changes in code and lets you undo mistakes or identify bugs. It’s also used to collaborate with other people - so you can share your code with other designers and developers on your team (or with other teams!). Git is a type of version control software.

This guide will walk you through setting up a Git repo (repository) and committing your work so that you can publish your prototype on the web.

> You don’t *have* to use Git to use the Prototype Kit, but it will be really useful if you learn some basics.

> Git is not the same as GitHub. Git stores versions of your work, and lets you collaborate more easily with others. GitHub puts it all online with a nice web interface.

You'll need to install Git first. 

[Git installation instructions for Mac, Windows, and Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

Once you've done that, read below to get set up.

## 1. Set up Git

Before using Git, it's best to set it up with your name and email address, this helps other people know who worked on what.

In terminal:
```
git config --global user.name "YOUR NAME"
git config --global user.email "YOUR EMAIL ADDRESS"
```

For example,  `git config --global user.name "John Smith"`

If you have an account on GitHub, use the *same* email address for both.

## 2. Initialise a Git repo

The first time you want to use Git on your prototype, you need to initialise it.

In your prototype folder:
```
git init
```

This sets up Git to track the files in your prototype folder.

The default branch created by the `git init` command is called `master`, which is a [potentially offensive term](https://sfconservancy.org/news/2020/jun/23/gitbranchname/). Rename the current branch to `main` instead:
```
git branch -M main
```

## 3. Check the Git status

It’s a good idea to run `git status` frequently. This tells you the current status - for example, if you made changes to files that haven’t been committed.

In your prototype folder:
```
git status
```

As this is a new Git repo, all files in the kit will be listed as having changes.

## 4. Doing your first commit

There are two stages to committing your changes. The first is to select the specific files with changes you want to commit, called **‘staging’**. The second is to commit all the changes in ‘staging’.

### Select files you want to commit

As this is our first commit, we want to add **all** files to ‘staging’

#### Adding all files that have changes

In terminal:
```
git add .
```
> In everyday use, you will use a different command to only pick specific files with changes rather than all at once.


### Check Git status

Run `git status` to check the files you’ve got in the stage. You will see a list of all the files just added under the heading `Changes to be committed`.

### Commit the files in ‘staging’

Run:
```
git commit -m "First commit"
```
The message you put in the speech marks should be descriptive of the changes you are committing. This will help in the future if you or someone else needs to look back at your changes and know why you made them.

Read more about writing good commit messages in the [Git style guide in the 'How to store source code' page of the GDS Way](https://gds-way.cloudapps.digital/standards/source-code.html#commit-messages).

## 5. Check Git status again

Run `git status` again and it should say `Nothing to commit` - all the changes you selected have been saved.

## 6. Learning Git

We recommend doing a tutorial on Git basics. Once you’ve done that, the best thing is to keep using Git each day (commit at least one change, etc) so it becomes familiar to you. Ask developers on your team to help you until you’re comfortable on your own.

[GitHub tutorial on Git](https://try.github.io/levels/1/challenges/1)

[Advanced Git tutorial](http://think-like-a-git.net/)

> Git can be used via the command line or using an app. It’s up to you which you learn. Most developers use the command line, so if you’d like help from them, it’s often better to use that.
