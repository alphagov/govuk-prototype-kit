# Make a page

This guide explains how to make a page in your prototype.

To follow this guide, you need to have [installed and started the Prototype Kit](/docs/get-started).

Make sure you can preview your prototype at http://localhost:3000 and have your code editor open.

## Where to save your pages

You can see all the files in the Prototype Kit in your code editor.

You should save new pages in the /app/views folder. This will add them to your prototype and let you preview them. 

The quickest way to create a new page is to start with one of the templates which live in docs/views/templates. 

In your code editor, choose the page which is closest to the one you want to create, or start with a blank page template. You can see what the pages look like by following these links:

- [blank page](/docs/templates/blank-govuk)
- [blank unbranded page](/docs/templates/blank-unbranded)
- [confirmation page](/docs/templates/confirmation)
- [content page](/docs/templates/content)
- [check answers page](/docs/templates/check-your-answers)
- [question page](/docs/templates/question)
- [start page](/docs/templates/start)
- [step by step navigation page](/docs/templates/step-by-step-navigation)
- [start page with step by step navigation](/docs/templates/start-with-step-by-step)
- [task list](/docs/templates/task-list)

Copy the page you want and paste it into your /app/views folder. 

Once the page is in your app/views folder, rename it to something that describes the page you want to create. When naming pages: 

- use only lowercase letters 
- separate words with hyphens
- end the page name `.html` 

For example, `my-first-page.html`.

## Preview your page

The URLs of pages in your prototype reflect the name of the page file in your folder structure. 

For example, if your page is called  `my-first-page.html`, you can preview it by going to http://localhost:3000/my-first-page in your web browser.

Check your new page is working.

## Editing your page

You can edit, remove or add content to your page in your code editor. Your preview will automatically refresh in the browser when you make a change. This can take a few seconds.

To check if this is working, make a small change to your page, like changing the page heading and save it. Do this by pressing the `cmd` and `s` keys at the same time on a Mac, or `ctrl` and `c` on Windows.

Go back and look at your preview. It should show your update. 

Preview your changes regularly when you’re prototyping, to make sure it’s working. If your preview stops updating, it might be because you haven’t saved your changes, or are working in the wrong file.

You’ll find lots of useful things to add to your page, like [buttons](https://kit_docs_prototype--govuk-design-system-preview.netlify.com/components/button/), [checkboxes](https://kit_docs_prototype--govuk-design-system-preview.netlify.com/components/checkboxes/), and [links](https://kit_docs_prototype--govuk-design-system-preview.netlify.com/styles/typography/#links) in the [GOV.UK Design System](https://kit_docs_prototype--govuk-design-system-preview.netlify.com/).

You can copy the code for examples in the Design System by selecting the tabs at the bottom of each example. 

<img class="bordered" src="/public/images/docs/button-example-design-system.png" alt="a button example in the design system with code underneath and a copy button">

Code for the examples is provided in both HTML, and in a coding language called Nunjucks.
Nunjucks is a kind of shorthand, which generates HTML, using fewer lines of code. 

Both HTML and Nunjucks work in the Prototype Kit. Nunjucks can be a bit confusing if you’re not familiar with it and are used to HTML. If you haven’t used it before, start with HTML. 

