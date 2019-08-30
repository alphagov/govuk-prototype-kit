# Publishing on the web (GOV.UK PaaS)

We recommend using [GOV.UK PaaS](https://www.cloud.service.gov.uk) to get your prototype online.  It’s simple and fast to deploy new versions as you work.

Once your prototype is on GOV.UK PaaS, other people will be able to access and try your prototype from their own computers or mobile devices.

> **DO NOT** enter real user data in to prototypes hosted on GOV.UK PaaS. If your prototype stores or collects user data, talk to a security professional about appropriate security steps you must take.

A prototype deployed to GOV.UK PaaS is called an `app` - it will have a url like:

`your-prototype.london.cloudapps.digital`

or

`your-prototype.cloudapps.digital`

depending on which region your GOV.UK PaaS account is in.

You can have multiple apps running on GOV.UK PaaS - projects often have several so they can try different ideas out at once.

## 1) Get started with GOV.UK PaaS

Follow the [GOV.UK PaaS get started guide](https://docs.cloud.service.gov.uk/get_started.html#get-started) to:

- download and install the Cloud Foundry CLI
- log in to GOV.UK PaaS using the Cloud Foundry CLI

## 2) Choose a name for your app

Think of a name for your app. You need to choose a name that’s unique. The name is used in the url for your prototype. For example the name:

`govuk-payments-prototype`

will create an app at:

`govuk-payments-prototype.london.cloudapps.digital`

or

`govuk-payments-prototype.cloudapps.digital`

depending on which region your GOV.UK PaaS account is in.

## 3) Push your application to GOV.UK PaaS

In the terminal, go to the folder of your prototype and run:

```
cf push --var prototype-name=name-of-your-app \
        --var username=myusername \
        --var password=secret
```

Replace `name-of-your-app` with your app name from step 2.

## 4) View your prototype on the web

After you have deployed your work, you will be able to view it on the web by visiting:

`name-of-your-app.london.cloudapps.digital`

or

`name-of-your-app.cloudapps.digital`

depending on which region your GOV.UK PaaS account is in.

The terminal output of the push command will include a link to your prototype.

---

This deployment process uses the `manifest.yml` file in the folder of your prototype.

You can customise it, for instance if you want to disable authentication and make your app open to everyone.

Guidance on how to do this in the file itself (`manifest.yml`) or in the
[GOV.UK PaaS documentation](https://docs.cloud.service.gov.uk/deploying_apps.html#deploying-public-apps).

---

If your prototype repo is public but you need the password to be secret, and you're using a continuous deployment tool, you can use environment variables when pushing your app:

```
cf push --var prototype-name=my-new-service \
        --var username=hello \
        --var "password=$PASSWORD"
```

You should configure this `cf push` command in the system you've set up to do the
deployment, for example: [how Travis CI works with encrypted
variables](https://docs.travis-ci.com/user/environment-variables/#defining-encrypted-variables-in-travisyml)
or [how to create and use secrets with GitHub
Actions](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables).
