# Instructions for developers

There are multiple ways of running the application locally.

## Native

It's built on the [Express](http://expressjs.com/) framework, and uses [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend).

### Requirements

node.js - version 8.x.x

### Install dependencies

```
npm install
```

### Run the kit
```
npm start
```

Go to [localhost:3000](http://localhost:3000) in your browser.

## Docker

You may choose to run the application in the docker environment. Doing so you'd
probably be driven by some of the following:

- avoid installing/managing node on your machine
- avoid remembering to install/compile dependencies
- running application in an artifact way
  - ability to push to Kubernetes (RE Build & Run) or CloudFoundry (GOV.UK PaaS)
- run in _production-like_ environment

We've placed a `Dockerfile` in the root of the project.

You can build an image by running the following:

```
docker build . -t govuk-prototype-kit:latest
```

This step will pull a small image containing a base operating system with node
pre-installed. Additionally, will mount your current working directory along
with installing some `node_modules`.

You can run it afterwards with:

```
docker run -p 3000:3000 govuk-prototype-kit:latest
```

The application will listen on your exposed port (`3000` in this case). You
should be able to visit http://localhost:3000/

