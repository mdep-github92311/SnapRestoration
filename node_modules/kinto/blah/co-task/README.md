co-task [![Build Status](http://img.shields.io/travis/jsantell/co-task.svg?style=flat-square)](https://travis-ci.org/jsantell/co-task)
=======

[co](https://github.com/visionmedia/co) wrapper as [Task.jsm](https://github.com/mozilla/gecko-dev/blob/master/toolkit/modules/Task.jsm) API. Task.jsm is a subset of [task.js](http://taskjs.org/) for use inside Mozilla.

## Setup

`co-task` requires [harmony generators](http://wiki.ecmascript.org/doku.php?id=harmony:generators) and native [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), so running node >= 0.11.2 is required with the `--harmony` flag.

Install via npm

```
$ npm install co-task --save
```

And running with `--harmony` flags in node, say `file.js` consumes `co-task`, run via:

```
$ node --harmony file.js
```

## API

### Task.spawn(generatorFn)

The "Task.spawn" function takes a generator function and starts running it as a task.
Every time the task yields a promise, it waits until the promise is
fulfilled. "Task.spawn" returns a promise that is resolved when the task completes
successfully, or is rejected if an exception occurs.

```
function fetchUserData (user) {
  return Task.spawn(function* () {
    var user = yield getUser();
    return yield getDataForUser(user);
  });
});

fetchUserData("big foot").then(function (data) {
  console.log(data);
});
```

### Task.async(generatorFn)

Create and return an 'async function' that starts a new task. This is similar to 'spawn'
except that it doesn't immediately start the task, it binds the task to the async
function's 'this' object and arguments, and it requires the task to be a function.
It simplifies the common pattern of implementing a method via a task,
like this simple object with a 'greet' method that has a 'name' parameter
and spawns a task to send a greeting and return its reply.

```
let greeter = {
  message: "Hello, NAME!",
  greet: Task.async(function* (name) {
    return yield sendGreeting(this.message.replace(/NAME/, name));
  })
};
```

## Development

`npm test`

## License

MIT License, Copyright (c) 2014 Jordan Santell
