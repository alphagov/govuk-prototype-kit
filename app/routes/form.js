'use strict';

var validation = require(__dirname + '/../lib/validation/form');

module.exports = function (router) {

    router.post('/answer-question', function (req, res, next) {
        var body = req.body;
        var formAttributes;
        var validationProfile;
        var successRedirect = body['success_redirect'] && body['success_redirect'];
        var failureRedirect = body['failure_redirect'] && body['failure_redirect'];
        var errors;
        var redirectTo;

        validationProfile = validation.createValidationProfile(body);
        errors = validation.runValidation(validationProfile, body);
        formAttributes = validation.removeValidationFormAttributes(body);
        req.form.addData(formAttributes);

        if (validation.hasErrors(errors)) {
            req.form.addErrors(errors);
            redirectTo = failureRedirect;
        } else {
            redirectTo = successRedirect;
        }

        res.redirect(redirectTo);
    });
}
