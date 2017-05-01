# Publishing on the web (GOV.UK PaaS)

[GOV.UK PaaS](https://www.cloud.service.gov.uk/) is another way to get your prototype online. It’s simple and fast to deploy new versions as you work, learning <code>git</code> isn't essential, and the platform is accredited to 'Official'.

Once your prototype is on PaaS, other people will be able to access and try your prototype from their own computers or mobile devices.

> We'll show how to secure your prototype in step 6 but *DO NOT* enter real user data in to prototypes hosted on PaaS. If your prototype stores or collects user data, talk to a security professional about appropriate security steps you and your developer colleagues must take.

## 1) Sign up for an account
You need to be able to log in to your account each time you want to publish a new version of a prototype.

[Create an account](https://www.cloud.service.gov.uk/request-trial.html) and return to this page, or move on to step 2 if you already have one.

## 2) Install the PaaS/Cloud Foundry command line tools

GOV.UK PaaS is built on top of an open source technology called Cloud Foundry. You need to install a command line interface (<abbr>CLI</abbr>) tool to interact with it through a terminal window.

There are a couple of ways to do the installation.

* You can [get the install package (.pkg)](https://github.com/cloudfoundry/cli#installers-and-compressed-binaries) from the Cloud foundry github page. Once downloaded double click to start the installation.
* Or if you [use a package manager](https://github.com/cloudfoundry/cli#installing-using-a-package-manager) the Cloud Foundry CLI can be installed that way

![Installer downloads are quite a long way down the github page](/public/images/docs/cloudfoundry_cli_installers.png)

>Because PaaS is built on top of Cloud Foundry, the most common command is `cf` - asking the underlying technology to do things with your code on a remote server.

After following your preferred method, check that it's installed correctly by opening a terminal window and running

```
cf -v
```

You should get a message like this, confirming the installed version:

```
cf version X.X.X...
```

For more information check the [PaaS setup docs](https://docs.cloud.service.gov.uk/#quick-setup-guide)

## 3) Login to GOV.UK PaaS

Log in on the commandline by typing this

```
cf login -a api.cloud.service.gov.uk -u USERNAME
```

Where **USERNAME** is the email address your account was created with.

You’ll then be prompted to enter your password.

## 4) Choose name for prototype
Go to the home folder of your prototype and see if the `manifest.yml` file exists. For a freshly downloaded prototype kit it should look similar to this:

```
---
applications:
- name: [NAME_OF_YOUR_APP]
  memory: 128M
```

If there isn't one, create it then copy and paste the content shown.

Next, replace `[NAME_OF_YOUR_APP]` with a name for your prototype (making sure you don't leave the square brackets). This name will be used in the url for your prototype, so choose a name that is unique.

For example: `govuk-payments-prototype` will create an app at: `govuk-payments-prototype.cloudapps.digital`

## 5) Push your app

In the folder where you've been working on your prototype, run:

```
cf push
```
This will create a Cloud foundry `app` if one by that name doesn't exist already. It will copy across all your prototype files.

> You can override the name in the manifest and push to a different URL by including the new name in the <code>cf</code> command. For example:
>
> ```
> cf push [new-name-here]
> ```
>
>This can be useful when testing multiple versions.

It will take a few minutes to deploy. If you encounter any issues please contact the [GOV.UK PaaS support team](https://www.cloud.service.gov.uk/support.html) - we want to make this easy for you!

Once finished you will be provided with the URL for you prototype. You'll need this after we've set up the HTTP basic auth.

![URL can be found in the penultimate block of text](/public/images/docs/paas_deploy_commandline.png)

## 6) Set a username and password

To protect your prototype from public discovery, enter the following commands on the terminal to set a username and password.

For the username:

```
cf set-env [NAME_OF_YOUR_APP] USERNAME [username_here]
```

For the password

```
cf set-env [NAME_OF_YOUR_APP] PASSWORD [password_here]
```

You need to restart your prototype for these changes to take effect. After setting environment variables, the Cloud Foundry software will prompt you to `restage` by default, which is a complete reload from the code. In this case we can use the quicker `restart` command.

```
cf restart [NAME_OF_YOUR_APP]
```


## 7) View your prototype on the web

After your work is deployed, you will be able to view it on the web by visiting `https://[NAME_OF_YOUR_APP].cloudapps.digital`.

If you are not sure what that is, or have forgotten what you called your app, you can find out all your deployed apps and their URLs by typing:

```
cf apps
```

### Further reading on GOV.UK PaaS

* [How to manage your space quota](/docs/how-to-manage-your-space-quota)
* [Github and PaaS/Cloud Foundry](/docs/github-and-cloudfoundry)
* [Using Travis CI with PaaS](https://docs.cloud.service.gov.uk/#use-travis)
* [Deploying apps to PaaS](https://docs.cloud.service.gov.uk/#deployment-overview)
