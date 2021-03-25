# Publishing on the web (Heroku)

Heroku runs your prototype online, the same as it runs on your machine, but available to others at any time. Other similar services are available.

1. [Create a free Heroku account](https://heroku.com)

2. In the top right click **New** then **Create new app**.

![Screenshot of Heroku Create App page](/public/images/docs/heroku-create-app.png)

3. Enter a name for your prototype app. App names in Heroku have to be unique across all the users of Heroku. It can be helpful to add your name or organisation to the start of the name to make it unique. For example joelanman-juggling-prototype.

4. Select Europe for the region - it’s not important but makes your prototype a bit faster.

5. Click **Create app**.

6. For **Deployment method** choose **GitHub**. ‘Deploy’ means publish.

![Screenshot of Heroku deploy page](/public/images/docs/heroku-deploy.png)

7. Scroll down and click **Connect to GitHub**.

8. In the popup, click **Authorize Heroku**.

9. In the repo-name field, click **search**. You can leave it blank and it will give a list of all your repos.

10. Click **connect** on the right of your repo.

11. Scroll down to the **Automatic deploy** section and click **Enable Automatic Deploys**.

12. Scroll down to the **Manual deploy** section and click **Deploy branch**.

13. Wait for the deploy to finish.

Your prototype will deploy automatically each time you push your code to GitHub (it takes a few minutes each time).

## Set a username and password

We need to set a username and password or the Prototype Kit won’t run online. They don’t have to be complicated – it’s just to stop people accidentally coming across your prototype online and mistaking it for a real service.

1. At the top click the **Settings** tab.

2. Click **Reveal config vars**.

3. In KEY put the word USERNAME

4. In VALUE put a username of your choice, click **Add**.

That will be saved and you can add another KEY and VALUE.

5. In KEY put the word PASSWORD

6. In VALUE put a password of your choice, click **Add**.

7. In the top right, click **Open app** to see your prototype online!
