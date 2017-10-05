'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var $ = require('jquery');

var app = module.exports = loopback();

/*GLOBAL.window = {};
GLOBAL.document = {
  documentElement: {
    style: {}
  },
  getElementsByTagName: function() { return []; },
  createElement: function() { return {}; }
};
GLOBAL.navigator = {
  userAgent: 'nodejs'
};
GLOBAL.L = require('leaflet');
//var L = require('leaflet');
require('leaflet-sidebar');
require('leaflet.markercluster');

GLOBAL.L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

*/
var path = require('path');
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
// This is to check for errors on startup 
// Comment out when errors are found. //
//process.on('uncaughtException', function (err) { console.log(err); });


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
