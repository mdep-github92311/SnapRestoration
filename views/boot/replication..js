module.exports = function (client) {
  var LocalBarrier = client.models.LocalBarrier;
  var RemoteBarrier = client.models.RemoteBarrier;

  var since = {push: -1, pull: -1};

  function sync() {
    LocalBarrier.replicate(
      RemoteBarrier,
      since.push,
      function pushed(err, conflicts, cps) {
        if (conflicts.length)
          handleConflicts(conflicts);

        since.push = cps;

        RemoteBarrier.replicate(
          LocalBarrier,
          since.pull,
          function pulled(err, conflicts, cps) {
            if (conflicts)
              handleConflicts(conflicts.map(function (c) {
                return c.swapParties();
              }));
            since.pull = cps;
          });
      });
  }
  LocalBarrier.observe('after save', function(ctx, next) {
    next();
    sync();
  });

  function handleConflicts(conflicts) {
    console.warn('something isnt right', conflicts)
  }
};
