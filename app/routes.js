const express = require("express");
const router = express.Router();
if (process.env.NOTIFYAPIKEY) {
  var NotifyClient = require("notifications-node-client").NotifyClient,
    notify = new NotifyClient(process.env.NOTIFYAPIKEY);
}

router.post("/v2-2-0-school/send-email", (req, res) => {
  console.log(`SENDING EMAIL TO ${req.body.email}`);
  if (notify) {
    notify.sendEmail("8258beb7-4f85-4581-9404-759c25e1c8b9", req.body.email, {
      personalisation: {
        authLink:
          "https://ecf-prototype.herokuapp.com/v2-2-0-school/create-account?token=1234"
      }
    });
  }
  res.redirect("/v2-2-0-school/check-email");
});

router.post("/v2-1-0-supplier/send-email", (req, res) => {
  if (notify) {
    notify.sendEmail("", req.body.email, {
      personalisation: {
        authLink:
          "https://ecf-prototype.herokuapp.com/v2-1-0-supplier/dashboard?token=1234"
      }
    });
  }
  res.redirect("/v2-1-0-supplier/check-email");
});

module.exports = router;
