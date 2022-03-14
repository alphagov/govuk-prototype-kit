---
title: Share usage data
---
# Share usage data

You can choose to have the Prototype Kit send anonymous usage data for analysis.
This helps the team working on the Kit understand how it's being used, in order
to improve it - please don't turn off usage data unless you have to.

## How it works

When you first run the Prototype Kit, it will ask you for permission to send
usage data to Google Analytics. It will store your answer in `usage-data-config.json` and it won't ask
you again.

If you say yes, it will store an anonymous, unique ID number in `usage-data-config.json`.

## Data we collect

The kit will only send data when you run it on your computer. It does not send data when you run it on Heroku.

Whenever you start the Prototype Kit, it will send:

 - your anonymous ID number
 - the Prototype Kit version number
 - your operating system (for example 'Windows 10')
 - your Node.js version

## Change usage data settings

You can start or stop sending usage data at any time. Delete `usage-data-config.json`
and restart the Prototype Kit. It will ask you again whether you'd like to send data.
