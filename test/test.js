/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;
var assert  = require('assert');

describe('phonegap generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator('phonegap:app', [
        '../../app', [helpers.createDummyGenerator(), 'mocha:app']
      ]);
      done();
    }.bind(this));
  });

  it('can be imported without blowing up', function () {
    this.phonegapapp = require('../app');
  });

  
  it('creates expected files', function (done) {
    var expected = [
      // add files you expect to exist here.
      '.jshintrc',
      '.editorconfig'
    ];

    helpers.mockPrompt(this.app, {
		projectName: "test",
		appPackage: "com.phonegapgenerator.test",
    	features: ['ios']
    });

    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });


});
