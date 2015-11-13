'use strict';

/**
 * middleware helper to assist with form errors and form data
 * @param req
 * @param res
 * @param next
 */
module.exports = function (req, res, next) {
    var session = req.session;
    var form;

    session.form = session.form || { errors: [], body: {}};
    form = req.form = req.form || {};


    /**
     * add errors into session
     * @param errors
     */
    form.addErrors = function  (errors) {
        session.form.errors.push(errors);
    };

    /**
     * pull errors out of the session
     * @returns {T}
     */
    form.getErrors = function () {
        return session.form.errors.shift();
    };

    /**
     * add form data onto the session
     * @param details
     */
    form.addData = function  (details) {
        session.form.body = details;
    };

    /**
     * pull form data out of the session
     * @returns {body|{}}
     */
    form.getData = function () {
        var body = session.form.body;

        session.form.body = {};
        return body;
    };

    next();
}
