var loopback = require('loopback');
var boot = require('loopback-boot');
var compression = require('compression');
var bodyParser = require('body-parser');
var app = module.exports = loopback();
var session = require('client-sessions');
var path = require('path');
var crypto = require("crypto");
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
// var MapboxClient = require("mapbox")
// var client = new MapboxClient('sk.eyJ1IjoiYnJzdGlsbHdlbGwiLCJhIjoiY2pja2E3cXF5MDltYTMycGlsOXd5Y2t5MiJ9.kAYb7BXmXOkNaERkP-LqJQ');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(compression({ threshold: 0 }));
app.use(loopback.static(__dirname+'../views'));

app.use(session({
  cookieName: 'session',
  secret: crypto.randomBytes(20).toString('hex'),
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

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
