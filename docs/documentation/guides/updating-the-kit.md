# Updating the kit

**Important note**

If you have made any changes outside the `app` folder, this process will destroy those changes. We will try and improve the update process to avoid this, but in the meantime you will need to make a note of your changes outside `app`, and add them back after updating.

## Updating from version 6 to version 7

Version 7 of the GOV.UK Prototype Kit is a large change from previous versions.

If you have a large old prototype, follow this [guide to backward compatibility](/docs/backwards-compatibility) which lets you update the Prototype Kit without having to rewrite all your pages at once.

There is a [guide to updating your code](https://design-system.service.gov.uk/get-started/updating-your-code/) on the GOV.UK Design System.

## Steps

Download the latest Prototype Kit.

In your project, delete everything apart from the `app` and `.git` folder.

Copy everything from the latest kit to your project, apart from the `app` folder.

Copy the config.js file from the `app` folder in the latest kit to the `app` folder of your prototype. If you've made any changes to the config.js file in your prototype then you'll need to re-enter them in the new version of the file e.g. the service name.

Check `\app\assets\sass\patterns` in the latest kit for any new patterns. Copy the files over to your prototype.

Check `\app\assets\sass\application.scss` in the latest kit to see if any changes have been made in the top section, above where it says `// Add extra styles here`. Copy anything new from that file to the version in your prototype, making sure you don't overwrite any extra styles you have added yourself.

---

## Updating via the command line (Advanced)

If you have experience with the command line and your prototype is running within a git source repository then you can choose to update the kit with a series of commands.

Updating via the command line involves fetching the latest code from the 'upstream' remote repository and then merging it into the git branch that contains your version of the prototyping kit. Below are the steps for doing that in detail.

### Steps

#### View git remote(s)

Firstly change to the base directory of your prototyping kit in terminal, for example:

```
cd ~/sites/govuk-prototype-kit
```

Once in the directory start by listing the git remote(s) you have referenced from your machine. To do this you type:

 ```git remote -v``` and hit enter

This will typically output a list of all the remote git repositories that have the prototype code, for example:

```
origin  https://github.com/paulmsmith/govuk-prototype-kit.git (fetch)
origin  https://github.com/paulmsmith/govuk-prototype-kit.git (push)
```

So long as you can see a list of repositories as above, we can move on to adding a reference to the original 'alphagov' repository which we will need in order to update.

#### Adding the upstream remote repository

To add the alphagov remote repository, type the following command and hit enter:

```
git remote add upstream https://github.com/alphagov/govuk-prototype-kit.git
```

All being well, you will just return to a command prompt, now if you type:
```git remote -v```

You should see an 'upstream' in your list, for example:

```
origin	https://github.com/paulmsmith/govuk-prototype-kit.git (fetch)
origin	https://github.com/paulmsmith/govuk-prototype-kit.git (push)
upstream	https://github.com/alphagov/govuk-prototype-kit.git (fetch)
upstream	https://github.com/alphagov/govuk-prototype-kit.git (push)
```

#### Merging from upstream

Now that you've added the upstream remote, you can merge the latest code into yours with the following commands.

First you will 'fetch' the latest code from the upstream latest-release branch. Type the following command and wait a few seconds.

```
git fetch upstream latest-release
```

You will see it output a few lines telling you that was successful, for example:

```
From https://github.com/alphagov/govuk-prototype-kit
 * branch            latest-release    -> FETCH_HEAD
```

Next, we will merge the branch we just 'fetched' into our master branch (note: you can substitute 'master' for the branch you want to merge into if different)

```
git checkout master && git merge FETCH_HEAD
```

You shouldn't have any merge conflicts if you've not changed files outside of the 'app' folder. If you do, there are plenty of ways to fix the conflicts and [github has instructions](https://help.github.com/articles/resolving-a-merge-conflict-from-the-command-line/) that should be easy to follow if you need a refresher course.

Check that the application starts. In terminal or command prompt type:

```
npm start
```

After the kit has started, you should see a message telling you that the kit is running:

```
Listening on port 3000 url: http://localhost:3000
```

If you see an error after updating, you may need to download extra code used by the kit before it can run.

You can get this by running:

```
npm install
```

The install may take up to a minute. Whilst installing it may WARN about some items - this is ok. As long as there are no ERRORs you can continue.

In terminal:

```
npm start
```

If you still have an error, you can [raise an issue within github](https://github.com/alphagov/govuk-prototype-kit/issues) or ask in the [Slack channel for users of the Prototype Kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit/) by providing as much information as you can about the error and the computer you are attempting to run the prototyping kit on.
