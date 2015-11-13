'use strict';

/**
 * util to convert to string if array
 * @param value
 * @returns {*}
 */
var convertToString = function (value) {
    return value instanceof Array ? value.join('') : value;
};
/**
 * extract validation information from submitted form data
 * @param formData
 * @returns {{validationProfile}}
 */
module.exports.createValidationProfile = function (formData) {
    var validationProfile = {};

    Object.keys(formData)
        .map(function (prop) {
            if (prop.indexOf(':expected') >= 0) {
                var validationInfo = prop.split(':');
                var inputName = validationInfo[0];
                var expectedValue = formData[prop];

                validationProfile[inputName] = validationProfile[inputName] || {};
                validationProfile[inputName].expected = expectedValue;
            }
        });

    return validationProfile;
};

/**
 * Run the specified validation
 * @param validationProfile
 * @param formData
 * @returns {{errors}}
 */
module.exports.runValidation = function (validationProfile, formData) {
    var errors = {};

    Object.keys(validationProfile)
        .map(function (prop) {
            var answer = convertToString(formData[prop]);
            var validation = validationProfile[prop];
            var pattern = new RegExp(validation.expected);
            var isMatch = pattern.test(answer);

            if (!isMatch) {
                errors[prop] = true;
            }
        });

    return errors;
};

/**
 * Does the form have errors?
 * @param errors
 * @returns {boolean}
 */
module.exports.hasErrors = function (errors) {
    return !!Object.keys(errors).length;
};

/**
 * Strip out validation attribute information from the form data
 * @param formData
 * @returns {{}}
 */
module.exports.removeValidationFormAttributes = function (formData) {
    var formAttributes = {};

    Object.keys(formData)
        .map(function (prop) {
            if (prop.indexOf(':expected') === -1) {
                formAttributes[prop] = formData[prop];
            }
        });

    return formAttributes;
};
