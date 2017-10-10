var co = require("co");

exports.spawn = function spawn (fn) {
  return new Promise(function (resolve, reject) {
    co(fn)(function (err, res) {
      if (err)
        reject(err);
      else
        resolve(res);
    });
  });
};

exports.async = function async (fn) {
  return function () {
    var ctx = this;
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err)
          reject(err);
        else
          resolve(res);
      });
      co(fn).apply(ctx, args);
    });
  }
};
