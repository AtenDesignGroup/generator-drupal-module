var generators = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('modulename', { type: String, required: true });
    this.option('path', { type: String });
  },

  prompting: function() {
    var done = this.async();
    var prompts = [
      {
        name: 'name',
        message: 'Your module name',
        default: this.modulename
      },
      {
        name: 'description',
        message: 'Description',
        default: this.modulename + ' functionality'
      },
      {
        type: 'confirm',
        name: 'installFile',
        message: 'Include the .install file?',
        default: false
      },
      {
        type: 'confirm',
        name: 'includeTests',
        message: 'Include the tests directory?',
        default: false
      }
    ];

    if (!this.options.path) {
      var defaultPath = this._guessDefaultPath();
      prompts.push({
        name: 'directory',
        message: 'Location for module',
        default: defaultPath
      });
    }

    this.prompt(prompts, function(answers) {
      this.answers = answers;
      done();
    }.bind(this));
  },

  copyMainFiles: function() {
    var modulePath;
    if (this.options.path) {
      modulePath = path.join(this.options.path, this.modulename);
    }
    else {
      modulePath = path.join(this.answers.directory, this.modulename);
    }

    var context = this.answers;
    context.module = this.modulename;

    mkdirp.sync(modulePath);
    this.fs.copyTpl(this.templatePath('module/_module.info'), path.join(modulePath, this.modulename + '.info'), context);
    this.fs.copyTpl(this.templatePath('module/_module.module'), path.join(modulePath, this.modulename + '.module'), context);

    if (this.answers.installFile) {
      this.fs.copyTpl(this.templatePath('module/_module.install'), path.join(modulePath, this.modulename + '.install'), context);
    }

    if (this.answers.includeTests) {
      mkdirp.sync(path.join(modulePath, 'tests'));
    }
  },

  _guessDefaultPath: function() {
    var defaultPath = ['./'];
    if (fs.existsSync('./public_html')) {
      defaultPath.push('public_html');
    }

    var currentDefault = defaultPath.join(path.sep);
    var thisPath = path.join(currentDefault, 'sites/all/modules/custom');
    if (fs.existsSync(thisPath)) {
      return thisPath;
    }

    thisPath = path.join(currentDefault, 'sites/all/modules');
    return thisPath;
  }
});
