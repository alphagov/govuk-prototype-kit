# Show different pages depending on user input (branching)

Our first question asks the user how many balls they can juggle. We’re going to send them to an ‘ineligible’ page if they can only juggle 2 balls or less. Sending users to different pages based on their input is called branching.

To do this, we’re going to need an `ineligible.html` page, and some logic to decide when to send users there.

This kind of logic goes in a file called `app/routes.js`, which is written in JavaScript. Routes tell the kit what to do when the user goes to specific pages.

The route takes the answer the user gave to the first question and either sends them to the next question or the ineligible page, depending on their answer.

## Create an ineligible page

1. Make an `ineligible.html` page by copying `content.html` from `docs/views/templates` to `app/views`.

2. Update the content to tell the user why they’re ineligible and what they can do next.

Check it works by visiting http://localhost:3000/ineligible.

## Create a route

We’re going to write some logic to process the user’s answer to question 1. If the user can juggle 3 balls or more, we’ll send them to question 2. If they answer with anything else, we’ll send them to the ineligible page.

Currently, the `juggling-balls` page sends the user directly to question 2. Instead, we’re going to send them to a special URL where we can run some code to check their answer.

1. In `juggling-balls.html` change the form action to `/juggling-balls-answer`.

2. Open `/app/routes.js`.

3. Insert new JavaScript into line 5, before `module.exports = router`.

```
// Run this code when a form is submitted to 'juggling-balls-answer'
router.post('/juggling-balls-answer', function (req, res) {

  // Make a variable and give it the value from 'how-many-balls'
  var howManyBalls = req.session.data['how-many-balls']

  // Check whether the variable matches a condition
  if (howManyBalls == "3 or more"){
    // Send user to next page
    res.redirect('/juggling-trick')
  } else {
    // Send user to ineligible page
    res.redirect('/ineligible')
  }

})
```

4. Check it works. Selecting ‘3 or more’ should send you to the next question. Any other answer should send you to the ineligible page.

## If it does not work

If you do not get a page, check in the terminal to see if the kit has crashed. This is a common problem if there’s a typo in the JavaScript. If so, the kit will try to tell you the line number with the issue.

If the kit crashes, you will see something like this on the terminal:
```
/Users/name/projects/juggling-licence-prototype/app/routes.js:12
});
^
SyntaxError: Unexpected token }
    at Object.exports.runInThisContext (vm.js:76:16)
    at Module._compile (module.js:542:28)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)
    at Module.require (module.js:497:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/Users/[username]/projects/juggling-licence-prototype/server.js:7:14)
    at Module._compile (module.js:570:32)
[14:11:50] [nodemon] app crashed - waiting for file changes before starting…
```

The first line of this sample output ends with `/app/routes.js:12`.

The '12' suggests there’s probably an issue on line 12 or the line before it. In this case, the issue was a missing bracket.

[Next (Link your index page to your start page)](link-index-page-start-page)
