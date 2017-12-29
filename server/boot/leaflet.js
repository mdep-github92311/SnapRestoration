/**
 * Created by msgis-student on 6/9/2017.
 */
function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

module.exports = function (app) {
  // Install a "/ping" route that returns "pong"
  app.get('/', function (req, res) {
    res.render('leafletMap.pug');
  });
  
  app.get('/my_secret_page', checkAuth, function (req, res) {
    //res.send('if you are viewing this page it means you are logged in');
    var response = {
        status  : 200,
        success : 'Logged in successfully'
    }
    res.end(JSON.stringify(response));
  });

  app.post('/login', function (req, res) {
    var post = req.body;
    if (post.user === 'admin' && post.password === 'password') {
      req.session.user_id = 1;
      res.redirect('/my_secret_page');
    } else {
      res.send('Bad user/pass');
    }
  });
  
  app.get('/loginStatus', checkAuth, function (req, res) {
    var response = {
        status  : 200,
        success : 'Logged in successfully'
    }
    res.end(JSON.stringify(response));
  });
  
  app.get('/logout', function (req, res) {
    delete req.session.user_id;
    res.redirect('/login');
  });     
};

