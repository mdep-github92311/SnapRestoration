/**
 * Created by msgis-student on 6/9/2017.
 */
var path = require('path');
const url = require('url');   


module.exports = function (app) {
  
  function checkAuth(req, res, next) 
  {
    if (req.session.user == null) {
      res.send('You are not authorized to view this page');
      console.log(req.session.user)
    } else {
      console.log('you are logged in')
      next();
    }
  }
  app.get('/', function (req, res) {
    res.render('leafletMap.pug');
  });
  
  app.get('/mobile', function (req, res) {
    res.render('leafletMapMobile.pug');
  });
  app.get('/public', function (req, res) {
    res.render('leafletMapPublic.pug');
  });

  app.post('/login', function (req, res) {
    var post = req.body;
    res.redirect(url.format({
       pathname:"/checkLogin",
       query: [post.user, post.password]
     }));
  });
  
  app.get('/loginStatus', checkAuth, function (req, res) {
    var response = {
        status  : 200,
        success: 'Logged in successfully',
        user: req.session.user.user_name
    }
    res.end(JSON.stringify(response));
  });
  
  app.get('/logout', function (req, res) {
    if (req.session.user != null) {
      delete req.session.user;
      var response = {
          status  : 200,
          success : 'logged out successfully'
      }
      console.log(response);
      res.end(JSON.stringify(response));
    }
    else {
      var response = {
          status  : 201,
          error : 'No session ID'
      }
      console.log(response);
      res.end(JSON.stringify(response));
    }
  });     
};

