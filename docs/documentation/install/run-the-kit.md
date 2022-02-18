---
title: How to run the kit
caption: Installation guide for new users
---
# How to run the kit

You’ll use the terminal to start and stop the kit.

## Open the prototype folder in terminal

If you're following the installation guide, you'll already have the terminal open in the right folder.

If you're coming back to work on a prototype, you'll need to navigate to the folder:

```
cd ~/Documents/prototypes/juggling-licence
```

Or replace 'juggling-licence' with the name of your prototype.

## Running the kit

In the terminal, enter:
```
npm start
```

The first time you run `npm start`, the kit will ask you whether you want to send anonymous data to help the team improve the service. Enter `y` or `n` to answer yes or no. 

After the kit has started, you should see a message telling you that the kit is running:
```
Listening on port 3000 url: http://localhost:3000
```

## Check it works

In your web browser, <a href="http://localhost:3000" target="_blank">open http://localhost:3000 (opens in a new tab)</a>

<figure>

![The heading is GOV.UK Prototype Kit.](/public/images/docs/prototype-kit-homepage.png)

<figcaption class="govuk-body">Screenshot of what your prototype homepage should look like.</figcaption>
</figure>

## Quitting the kit

It’s fine to leave the kit running for days or while your computer is asleep.

To quit the kit, in the terminal press the `ctrl` and `c` keys together.

## Installation complete

The kit is now installed. Congratulations!

The Prototype Kit is updated regularly. We announce new versions of the Prototype Kit in the [#prototype-kit channel on cross-government Slack](https://ukgovernmentdigital.slack.com/messages/prototype-kit/). You should [update to the latest version of the kit](/docs/updating-the-kit) to get the latest components, new features and fixes.

## Make your first prototype

You can now start the tutorial to [make your first prototype](/docs/make-first-prototype/start).
