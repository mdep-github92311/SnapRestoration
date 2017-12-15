/**
 * Created by msgis-student on 6/9/2017.
 */

module.exports = function (app) {
  // Install a "/ping" route that returns "pong"
  app.get('/', function (req, res) {
    res.render('Add.pug');
  });
};

