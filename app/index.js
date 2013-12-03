'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var phonegap = require('phonegap');
var path = require('path');
var fs = require('fs');
var extfs = require('extended-fs');

var PhonegapGenerator = module.exports = function PhonegapGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(PhonegapGenerator, yeoman.generators.Base);

PhonegapGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
  {
    name: 'projectName',
    message: 'fooWhat is the name of your PhoneGap project?',
    default: 'Hello World'
  },
  { name: 'appPackage',
    message: 'What is your application package',
    default: 'com.phonegap.helloworld'
  },
{
  type: 'checkbox',
  name: 'features',
  message: 'What platform builds would you like?',
  choices: [{
    name: 'Android',
    value: 'android',
    checked: false
  }, {
    name: 'iOS',
    value: 'ios',
    checked: false
  }, {
    name: 'WP8',
    value: 'wp8',
    checked: false
  }]}
  ];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    this.projectName = answers.projectName;
    this.appPackage = answers.appPackage;

    function hasFeature(feat) { return features.indexOf(feat) !== -1; }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.compassBootstrap = hasFeature('compassBootstrap');
    this.includeRequireJS = hasFeature('includeRequireJS');
    this.includeModernizr = hasFeature('includeModernizr');

	var builds = []
	if(hasFeature('ios')) builds.push('\'ios\'');
	if(hasFeature('android')) builds.push('\'android\'');
	if(hasFeature('wp8')) builds.push('\'wp8\'');
	this.buildForPlatforms = "[" + builds.join(", ") + "]"; 

    cb();
  }.bind(this));
};

PhonegapGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

PhonegapGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

PhonegapGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

PhonegapGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

PhonegapGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

PhonegapGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

PhonegapGenerator.prototype.mainStylesheet = function mainStylesheet() {
  this.copy('main.css', 'app/styles/main.css');
};

PhonegapGenerator.prototype.writeIndex = function writeIndex() {

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.indexFile = this.engine(this.indexFile, this);

  if (!this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/index.js', [
      'scripts/index.js'
    ]);
	/*
    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/coffee.js',
      sourceFileList: ['scripts/hello.js'],
      searchPath: '.tmp'
    });
	*/
  }

};

// TODO(mklabs): to be put in a subgenerator like rjs:app
PhonegapGenerator.prototype.requirejs = function requirejs() {
  if (!this.includeRequireJS) {
    return;
  }

  this.indexFile = this.appendScripts(this.indexFile, 'app/scripts/main.js', ['bower_components/requirejs/require.js'], {
    'data-main': 'scripts/main'
  });

  // add a basic amd module
  this.copy('index.js', 'app/scripts/index.js');

  this.template('require_main.js', 'app/scripts/main.js');
};

PhonegapGenerator.prototype.app = function app() {
  this.write('app/index.html', this.indexFile);
  if (!this.includeRequireJS) {
  	this.copy('index.js', 'app/scripts/index.js');
  }
};

PhonegapGenerator.prototype.phonegapSetup = function phonegapSetup() {
	var self = this;
	phonegap.create({path:path.resolve('phonegap'), name: this.projectName, id: this.appPackage}, function(e) { self.log.create('Initialized PhoneGap project'); });
	//fs.rename(path.resolve('www/index.html'), path.resolve('www/index_old.html'), function() {self.log.info('Renamed Phonegap provided index.html -> index_old.html') });
	
	this.mkdir('app/res');
	this.mkdir('app/images');
	extfs.copyDirSync(path.resolve('phonegap/.cordova'), path.resolve('.cordova'), function(e) {self.log.create("Copied .cordova configuration") });
	//extfs.copyDirSync(path.resolve('phonegap/www/res'), path.resolve('app/res'), function(e) {self.log.create("moved app resources (splash screens etc) to app/res") });
	//extfs.copyDirSync(path.resolve('phonegap/www/img'), path.resolve('app/images'), function(e) {self.log.create("moved app images") });
	this.template('_config.xml', 'config.xml');
};
