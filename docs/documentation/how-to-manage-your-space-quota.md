# How to manage your space quota

Your trial PaaS account comes with a limited amount of space for your prototypes. There are things you can do to limit the amount of space you are actively using.

## Free up space

It is worth checking to see if you have any prototypes running that are no longer needed.

To see all the apps you have running in your space run:

```
cf apps
```

To stop an app run:

```
cf stop [NAME_OF_YOUR_APP]
```

This will stop your app running but it will still have an active URL (“route” in Cloud Foundry speak) and count against your quota.

To completely remove an app and any active routes (URLs) run:

```
cf delete -r
```

Running `cf apps` again will allow you to check it has been removed.

## Configure your deployment

By default each app will use 1G of memory. Lots of prototypes don't need as much memory as that but it will still count against your quota.

You can use a `manifest.yml` file to reduce the amount of memory an app uses.

Do this by including a `manifest.yml` file in the home directory of your prototype. The file should look similar to this:

```
---
applications:
- name: [NAME_OF_YOUR_APP]
  memory: 128M
```

The memory attribute requires a unit of measurement: M, MB, G, or GB, in upper case or lower case.

The manifest.yml file can also be used to reduce the complexity of your push command or add extra instances for resilience. There is [more information on using manifest.yml](http://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html) files in the Cloud foundry developer docs.

If your still need more space contact support to talk about increasing your quota above the free tier.
