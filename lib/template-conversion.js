var Hogan = require(__dirname + '/hogan.js'),
    fs = require('fs'),
    path = require('path'),
    govukDir = path.normalize(__dirname + '/../govuk'),
    govukConfig = require(govukDir + '/config'),
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
    govukTemplate = fs.readFileSync(govukDir + '/views/govuk_template.html', { encoding : 'utf-8' });
    compiledTemplate = Hogan.compile(govukTemplate);
    fs.writeFileSync(govukDir + '/views/govuk_template.html', compiledTemplate.render(govukConfig), { encoding : 'utf-8' });
  }
};
