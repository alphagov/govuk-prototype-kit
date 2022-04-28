---
title: Publish on the web
---
# Publish on the web (Heroku)

<div class="govuk-inset-text">

## Publishing GOV.UK Prototype Kit to Heroku, April 2022

Following a security incident, Heroku has temporarily stopped GitHub repositories automatically deploying to Heroku or deploying through its dashboard.

For Prototype Kit users this means the integration of prototypes from Heroku to GitHub has been turned off and you may not be able to use your new prototype for user research on Heroku.

### What to do

If you need to deploy on Heroku at the moment, the Prototype Kit team can help you to do this. [Contact the GOV.UK Prototype team](https://design-system.service.gov.uk/get-in-touch/).

### What happened

Heroku discovered unauthorised access to its GitHub account on 13 April 2022. As a result, it revoked all existing tokens from the Heroku GitHub integration and new OAuth tokens cannot be created until further notice. Heroku continues to investigate the incident.
[More on the Heroku security notification](https://status.heroku.com/incidents/2413).

</div>

## Publishing on Heroku

Heroku runs your prototype online, the same as it runs on your machine, but available to others at any time. Other similar services are available.

You'll need to have [put your code on GitHub](/docs/github-desktop) to use this guide. If you cannot put your code on GitHub, you can try [publishing to Heroku from the terminal](/docs/publishing-on-heroku-terminal) instead.

## Create an app on Heroku

1. [Create a free Heroku account](https://heroku.com)

2. In the top right click **New** then **Create new app**.

![Screenshot of a Heroku dashboard page that is titled 'Create a new app'. There are 2 input fields on the page. A text input labelled 'App name'. And a drop-down labelled 'Choose a region'. There is a button labelled 'Add to pipeline' and another button labelled 'Create app'.](/public/images/docs/heroku-create-app.png)

3. Enter a name for your prototype app. App names in Heroku have to be unique across all the users of Heroku. It can be helpful to add your name or organisation to the start of the name to make it unique. For example joelanman-juggling-prototype.

4. Select Europe for the region - it’s not important but makes your prototype a bit faster.

5. Click **Create app**.

## Deploy your prototype

1. For **Deployment method** choose **GitHub**. ‘Deploy’ means publish.

![Screenshot of a section on the Heroku page that has the heading 'Deployment method'. It lists 3 links, left to right: 1. Heroku Git. 2. GitHub. 3. Container Registry.](/public/images/docs/heroku-deploy.png)

2. Scroll down and click **Connect to GitHub**.

3. In the popup, click **Authorize Heroku**.

4. In the repo-name field, click **search**. You can leave it blank and it will give a list of all your repos.

5. Click **connect** on the right of your repo.

6. Scroll down to the **Automatic deploy** section and click **Enable Automatic Deploys**.

7. Scroll down to the **Manual deploy** section and click **Deploy branch**.

8. Wait for the deploy to finish.

Your prototype will deploy automatically each time you push your code to GitHub (it takes a few minutes each time).

## Set a password

You need to set a password or the Prototype Kit will not run online. This password does not have to be complicated. It's just to stop people accidentally finding your prototype online and mistaking it for a real service.

1. At the top of the Heroku page, click the **Settings** tab.

2. Click **Reveal config vars**.

3. In KEY, enter the word PASSWORD.

4. In VALUE, enter a password of your choice and click **Add**.

5. In the top right of the Heroku page, click **Open app** to see your prototype online.

### If you get an error about username

1. At the top of the Heroku page, click the **Settings** tab.

2. Click **Reveal config vars**.

3. In KEY, enter the word USERNAME.

4. In VALUE, enter a username of your choice and click **Add**.

5. In the top right of the Heroku page, click **Open app** to see your prototype online.
