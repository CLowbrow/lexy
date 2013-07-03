var Lexer = require('../lexer').Lexer;
var test = require('tap').test;
var util = require('./fixtures/tokens');

test("Lexer can be streamed to", function (t) {
  var lexy = Lexer(util.noChangeStates);
  lexy.write('hello there, ');
  lexy.write('my name is lexy');
  lexy.end();
  lexy.on('alldone', function () {
    t.equal(lexy.inputArr, "hello there, my name is lexy", "should concat multiple writes");
    t.end();
  });
});

test("Next function", function (t) {
  test("can advance pointer", function (t) {
    var lexy = Lexer(util.noChangeStates);
    lexy.write('hello there');
    lexy.pos = 0;
    lexy.next(function () {
      t.equal(lexy.pos, 1, "should have moved to 1");
      t.end();
    });
  });

  test("advance through the whole string and stop", function (t) {
    var lexy = Lexer(util.noChangeStates);
    lexy.write('hello there');
    lexy.end();
    lexy.on('alldone', function () {
      t.equal(lexy.pos, 'hello there'.length, "should move to end");
      t.end();
    });
  });
  t.end();
});

