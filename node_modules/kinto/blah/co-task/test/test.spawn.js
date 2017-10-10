var expect = require("chai").expect;
var Task = require("../");
var co = require("co");

function resolveLater (val) {
  var deferred = Promise.defer();
  setTimeout(deferred.resolve, 10, val);
  return deferred.promise;
}

describe("Task.spawn", function () {
  it("returns a promise that resolves to return value", function (done) {
    Task.spawn(function*() {
      var result = yield Promise.resolve("Value");
      for (var i = 0; i < 3; i++) {
        result += yield resolveLater("!");
      }
      return result;
    }).then(function (ret) {
      expect(ret).to.be.equal("Value!!!");
      done();
    });
  });
  
  it("returns a promise that rejects to an error if yielding a rejected promise", function (done) {
    Task.spawn(function*() {
      yield Promise.reject("an error");
    }).then(function () {}, function (err) {
      expect(err).to.be.equal("an error");
      done();
    });
  });
  
  it("if returning a promise, resolves return value before resolving overall promise", function (done) {
    var called = false;
    Task.spawn(function*() {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          called = true;
          resolve();
        }, 50);
      });
    }).then(function () {
      expect(called).to.be.equal(true);
      done();
    });
  });

  it("can itself be yielded", function (done) {
    Task.spawn(function*() {
      var one = yield Task.spawn(function*() { return Promise.resolve(1); });
      var two = yield Task.spawn(function*() { return Promise.resolve(2); });
      var three = yield Task.spawn(function*() { return 3; });
      expect(one).to.be.equal(1);
      expect(two).to.be.equal(2);
      expect(three).to.be.equal(3);
      done();
    });
  });
});
