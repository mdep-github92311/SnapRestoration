var expect = require("chai").expect;
var Task = require("../");

function resolveLater (val) {
  var deferred = Promise.defer();
  setTimeout(deferred.resolve, 10, val);
  return deferred.promise;
}

describe("Task.async", function () {
  it("returns a fn that returns a promise that resolves to return value", function (done) {
    Task.async(function*(val) {
      var result = yield Promise.resolve(val);
      for (var i = 0; i < 3; i++) {
        result += yield resolveLater("!");
      }
      return result;
    })("Value").then(function (ret) {
      expect(ret).to.be.equal("Value!!!");
      done();
    });
  });

  it("returns a fn that returns a promise that rejects to an error if yielding a rejected promise", function (done) {
    Task.async(function*(val) {
      yield Promise.reject(val);
    })("an error").then(function () {}, function (err) {
      expect(err).to.be.equal("an error");
      done();
    });
  });

  it("if returning a promise, resolves return value before resolving overall promise", function (done) {
    var called = false;
    Task.async(function*() {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          called = true;
          resolve();
        }, 50);
      });
    })().then(function () {
      expect(called).to.be.equal(true);
      done();
    });
  });

  it("can pass in arguments", function (done) {
    Task.async(function*(arg1, arg2) {
      expect(arg1).to.be.equal(1);
      expect(arg2).to.be.equal(2);
      done();
    })(1, 2);
  });

  it("can be called with `call`, setting context", function (done) {
    var ctx = {};
    Task.async(function*(arg1, arg2) {
      expect(this).to.be.equal(ctx);
      expect(arg1).to.be.equal(1);
      expect(arg2).to.be.equal(2);
      done();
    }).call(ctx, 1, 2);
  });

  it("can be called as a method", function (done) {
    var User = function (name) {
      this.name = name;
    };

    User.prototype.getName = Task.async(function*() {
      var name = yield resolveLater(this.name);
      return name;
    });

    var user = new User("big bear");
    user.getName().then(function (name) {
      expect(name).to.be.equal("big bear");
      done();
    });
  });
});
