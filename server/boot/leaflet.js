/**
 * Created by msgis-student on 6/9/2017.
 */
var path = require('path');
var users = 0;
function checkAuth(req, res, next) 
{
  console.log(req.session)
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('leafletMap.pug');
  });
  
  app.get('/mobile', function (req, res) {
    res.render('leafletMapMobile.pug');
  });
  
  app.get('/my_secret_page', checkAuth, function (req, res) {
    //res.send('if you are viewing this page it means you are logged in');
    console.log('you are logged in')
    var response = {
        status  : 200,
        success : 'Logged in successfully'
    }
    res.end(JSON.stringify(response));
  });

  app.post('/login', function (req, res) {
    var post = req.body;
    //console.log(req.session)
    if (post.user === 'admin' && post.password === 'password') {
      users++;
      req.session.user_id = users;
      //console.log(req.session)
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
    if (req.session.user_id != null) {
      delete req.session.user_id;
      var response = {
          status  : 200,
          success : 'logged out successfully'
      }
      res.end(JSON.stringify(response));
    }
    else {
      var response = {
          status  : 201,
          error : 'No session ID'
      }
      res.end(JSON.stringify(response));
    }
  });     
};

