# GitHub and Cloud Foundry

Unlike Heroku, GOV.UK PaaS's technology Cloud Foundry doesn’t depend on GitHub for you to deploy code. Pushing an app from your local machine is enough.

Git still provides advantages with version control and for collaboration. Using these features to ensure you have the most up to date code on your machine, you can simply push the app prototype from your local file system.

GOV.UK PaaS has [instructions for integrating a simple CI tool such as Travis](https://docs.cloud.service.gov.uk/#use-travis), which uses your GitHub repository to trigger deployments.

For more advanced teams, we already have instructions on working with [Jenkins](https://docs.cloud.service.gov.uk/#push-an-app-with-jenkins).

Because GOV.UK PaaS makes it so simple to create and destroy new environments, some teams even have URLs automatically created for different branches of their GitHub repositories.
