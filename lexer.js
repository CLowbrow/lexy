var EventEmitter = require('events').EventEmitter;
var Writable = require('stream').Writable;

//Lexer can emit "token" events and the "alldone" event

var Lexer = function (states) {

  var lexy = Writable()
    , cached = false
    , started = false
    , finished = false
    , cachedCallback = function () {
        console.log('something broke!');
      };

  // These two exposed for testing.
  // Writing to them will make you sa
  lexy.inputArr = '';
  lexy.pos = 0;

  lexy._write = function (chunk, enc, next) {
    lexy.inputArr += chunk.toString();
    if (cached) {
      lexy.next(cachedCallback);
      cached = false;
    }
    if(!started) {
      states[states.initial](lexy, done);
      started = true;
    }
    next();
  };

  lexy.on('finish', function() {
    finished = true;
  });

  /* ----------------------------------------
   *  METHODS USABLE BY STATES
   * ---------------------------------------- */

  lexy.emitToken = function (type) {
    var token = {
      type: type,
      value: lexy.inputArr.substring(0, lexy.pos)
    };
    if(lexy.pos !== 0) {
      lexy.emit('lexerToken', token);
      lexy.inputArr = lexy.inputArr.substring(lexy.pos);
      lexy.pos = 0;
    }
  };

  lexy.next = function (callback) {
    var rune = lexy.inputArr.charAt(lexy.pos);
    if (rune) {
      lexy.pos++;
      callback(rune);
    } else if (finished) {
      //let states know we've hit EOF
      callback(rune);
    } else {
      cached = true;
      cachedCallback = callback;
    }
  };

  lexy.backUp = function () {
    lexy.pos--;
  };

  lexy.ignore = function () {
    lexy.inputArr = lexy.inputArr.substring(lexy.pos)
    lexy.pos = 0;
  };

  lexy.rewind = function () {
    lexy.pos = 0;
  }

  lexy.peek = function (callback) {
    lexy.next(function (token) {
      lexy.backUp();
      callback(token);
    })
  };

  lexy.acceptMany = function (string, done) {
    lexy.next(function (next) {
      if (next === '' || string.toLowerCase().indexOf(next.toLowerCase()) < 0) {
        lexy.backUp();
        done();
      } else {
        lexy.acceptMany(string, done);
      }
    });
  };

  lexy.acceptUntil = function (string, done) {
    lexy.next(function (next) {
      if (next === '' || string.toLowerCase().indexOf(next.toLowerCase()) >= 0) {
        lexy.backUp();
        done();
      } else {
        lexy.acceptUntil(string, done);
      }
    });

  }

  lexy.ignoreMany = function (string, done) {
    lexy.acceptMany(string, function () {
      lexy.ignore()
      done();
    });
  };

  /* This is the engine. Each state function calls done with the next state function
   * or with false if we are done lexing
   */

  var done = function (nextState) {
    if(nextState) {
      //break up the recursion chain
      setImmediate(function () {
        nextState(lexy, done);
      });
    } else {
      lexy.emit('alldone');
    }
  }

  return lexy;
};

exports.Lexer = Lexer;