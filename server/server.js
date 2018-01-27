var loopback = require('loopback');
var boot = require('loopback-boot');
var compression = require('compression');
var bodyParser = require('body-parser');
var app = module.exports = loopback();
var session = require('client-sessions');
var path = require('path');
var crypto = require("crypto");
var clientCertificateAuth = require('client-certificate-auth');
var fs = require('fs');

app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(compression({ threshold: 0 }));
app.use(loopback.static(__dirname+'../views'));

app.use(session({
  cookieName: 'session',
  secret: crypto.randomBytes(20).toString('hex'),
  duration: 60 * 60 * 1000,
  activeDuration: 10 * 60 * 1000,
}));

// var opts = {
//   // Server SSL private key and certificate
//   key: fs.readFileSync('../certs/mojavedata.gov.pem'),
//   cert: fs.readFileSync('../certs/mojavedata.gov.cer'),
//   // issuer/CA certificate against which the client certificate will be
//   // validated. A certificate that is not signed by a provided CA will be
//   // rejected at the protocol layer.
//   ca: fs.readFileSync('../certs/ca-bundle.crt'),
//   // request a certificate, but don't necessarily reject connections from
//   // clients providing an untrusted or no certificate. This lets us protect only
//   // certain routes, or send a helpful error message to unauthenticated clients.
//   requestCert: true,
//   rejectUnauthorized: false
// };

// // add clientCertificateAuth to the middleware stack, passing it a callback
// // which will do further examination of the provided certificate.
// app.use(clientCertificateAuth(checkAuth));
// app.use(function(err, req, res, next) { console.log(err); next(); });

// app.get('/', function(req, res) {
//   res.send('Authorized!');
// });

// var checkAuth = function(cert) {
// /*
//   * allow access if certificate subject Common Name is 'Doug Prishpreed'.
//   * this is one of many ways you can authorize only certain authenticated
//   * certificate-holders; you might instead choose to check the certificate
//   * fingerprint, or apply some sort of role-based security based on e.g. the OU
//   * field of the certificate. You can also link into another layer of
//   * auth or session middleware here; for instance, you might pass the subject CN
//   * as a username to log the user in to your underlying authentication/session
//   * management layer.
//   */
//   console.log(cert)
//   return cert.subject.CN === 'Doug Prishpreed';
// };


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
