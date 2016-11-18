# Updating the kit

## Updating

**Important note**

If you have made any changes outside the `app` folder, this process will destroy those changes. We will try and improve the update process to avoid this, but in the meantime you will need to make a note of your changes outside `app`, and add them back after updating.

### Steps

Download the latest prototype kit zip file from GitHub

In your project, delete everything apart from the `app` and `.git` folder

Copy everything from the latest kit to your project, apart from the `app` folder

---

## Updating via the command line (Advanced)

If you have experience with the command line and your prototype is running within a git source repository then you can choose to update the kit with a series of commands.

Updating via the command line involves fetching the latest code from the 'upstream' remote repository and then merging it into the git branch that contains your version of the prototyping kit. Below are the steps for doing that in detail.

### Steps

#### View git remote(s)

Firstly change to the base directory of your prototyping kit in terminal, for example:

```
cd ~/sites/govuk_prototype_kit
```

Once in the directory start by listing the git remote(s) you have referenced from your machine. To do this you type:

 ```git remote -v``` and hit enter

This will typically output a list of all the remote git repositories that have the prototype code, for example:

```
origin  https://github.com/paulmsmith/govuk_prototype_kit.git (fetch)
origin  https://github.com/paulmsmith/govuk_prototype_kit.git (push)
```

So long as you can see a list of repositories as above, we can move on to adding a reference to the original 'alphagov' repository which we will need in order to update.

#### Adding the upstream remote repository

To add the alphagov remote repository, type the following command and hit enter:

```
git remote add upstream https://github.com/alphagov/govuk_prototype_kit.git
```

All being well, you will just return to a command prompt, now if you type:
```git remote -v```

You should see an 'upstream' in your list, for example:

```
origin	https://github.com/paulmsmith/govuk_prototype_kit.git (fetch)
origin	https://github.com/paulmsmith/govuk_prototype_kit.git (push)
upstream	https://github.com/alphagov/govuk_prototype_kit.git (fetch)
upstream	https://github.com/alphagov/govuk_prototype_kit.git (push)
```

#### Merging from upstream

Now that you've added the upstream remote, you can merge the latest code into yours with the following commands.

First you will 'fetch' the latest code from the upstream latest-release branch. Type the following command and wait a few seconds.

```
git fetch upstream latest-release
```

You will see it output a few lines telling you that was successful, for example:

```
From https://github.com/alphagov/govuk_prototype_kit
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

If you still have an error, you can [raise an issue within github](https://github.com/alphagov/govuk_prototype_kit/issues) or ask in the [Slack channel for users of the prototype kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit/) by providing as much information as you can about the error and the computer you are attempting to run the prototyping kit on.

---

## Converting old prototypes

Earlier versions of the prototype kit used a different templating language called Mustache.

Converting Mustache templates to Nunjucks ones is relatively simple. Here are the main things you'll need to do:

### Template inheritance

    {{<layout}}

    {{/layout}}

Becomes…

    {% extends "layout.html" %}

### Template blocks

    {{$pageTitle}}
        GOV.UK prototype kit
    {{/pageTitle}}

Becomes…

    {% block page_title %}
        GOV.UK prototype kit
    {% endblock %}

and

    {{$content}}
    .......
    {{/content}}

Becomes...

    {% block content %}
    ........
    {% endblock %}

### Includes

    {{>includes/breadcrumbs}}

Becomes…

    {% include "includes/breadcrumbs.html" %}
