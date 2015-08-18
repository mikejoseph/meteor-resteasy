Package.describe({
  name: 'mikejoseph:resteasy',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Easily connect to REST APIs',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/mikejoseph/meteor-resteasy',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('meteorhacks:async');
  api.use('underscore');

  api.addFiles('resteasy.js', 'server');

  api.export('Resteasy');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mikejoseph:resteasy');
  api.addFiles('resteasy-tests.js');
});
