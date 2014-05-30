
var Hogan = require(__dirname + '/hogan.js');
var ReadDir = require('readdir');
var Path = require('path');
var FS = require('fs');

function TemplateEngine() {
}

/**
 * All active directory file system watches
 * @type {fs.FSWatcher[]}
 * @ignore
 */
TemplateEngine._watches = [];

/**
 * Called by the express server to get the content for a given template at the templatePath supplied. The templateData
 * can contain any content from a configured route, and will be made available to the templates.
 *
 * Templates can include partials by name for any template also in the views directory, note that if sub-directories are
 * used to create included partials, express will not necessarily recognise that file as a valid view path... you've been
 * warned.
 *
 * @param {String} templatePath Path to the template
 * @param {Object} templateData Data to give to the template
 * @param {Function} next Callback to receive two arguments, an error object and the template result.
 */
TemplateEngine.__express = function(templatePath, templateData, next) {
   var templateName = Path.basename(templatePath, Path.extname(templatePath));
   var templates = TemplateEngine._getTemplates([templateData.settings.views, templateData.settings.vendorViews]);
   var output = null, error = null;

   try {
      output = templates[templateName].render(templateData, templates);
   }
   catch (e) {
      error = e;
   }
   finally {
      next(error, output);
   }
};

/**
 * Stores an individual template based on the supplied path, the name of the template is the file's basename without
 * the extension.
 *
 * @param {String} templatePath
 */
TemplateEngine._storeTemplate = function(templatePath) {
   var templateName = Path.basename(templatePath, Path.extname(templatePath));
   TemplateEngine.__templates[templateName] = Hogan.compile(FS.readFileSync(templatePath, 'utf-8'));

   console.log('Stored template', templateName);
};

/**
 * Gets all templates, when the template path hasn't yet been scanned it will be read synchronously to ensure there are
 * always templates available.
 *
 * @param {Array} templatePaths
 */
TemplateEngine._getTemplates = function(templatePaths) {
   TemplateEngine.__templates = {};
   for (var i = 0, j = templatePaths.length; i < j; i++) {
     ReadDir.readSync(templatePaths[i], ['**.html'], ReadDir.ABSOLUTE_PATHS)
      .forEach(TemplateEngine._storeTemplate, TemplateEngine);
   }
   return TemplateEngine.__templates;
};

module.exports = TemplateEngine;
