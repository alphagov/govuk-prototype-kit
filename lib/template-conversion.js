var Hogan = require('hogan.js'),
    fs = require('fs'),
    path = require('path'),
    govukDir = path.normalize(__dirname + '/../govuk_modules'),
    govukConfig = require(__dirname + '/template-config'),
    compiledTemplate,
    govukTemplate,
    handleErr;

handleErr = function (err) {
  if (err) {
    throw err;
  }
};

module.exports = {
  convert : function () {
    govukTemplate = fs.readFileSync(govukDir + '/govuk_template/views/layouts/govuk_template.html', { encoding : 'utf-8' });
    compiledTemplate = Hogan.compile(govukTemplate);
    fs.writeFileSync(govukDir + '/govuk_template/views/layouts/govuk_template.html', compiledTemplate.render(govukConfig), { encoding : 'utf-8' });
  }
};
