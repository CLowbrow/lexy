var Lexer = require('../lexer').Lexer;
var domain = require('domain');
var fs = require('fs');

/*

We are going to be lexing a SUBSET OF JSON.
In this subset, the values can only be strings or objects
and quotes can only be double quotes.

The allowed variations:

{"key": "value"}
- OR -
{"key": {"key2": "value"}}
- OR -
{"key": "value", "key2": "value2"}
- OR -
{"key": {"key2": "value"}, "key3": "value2"}

We will not be accounting for escaped characters.

This is for simplicity. Lexing the full syntax would require validating
numbers, which would make this example needlessly complicated.

*/

// THE STATES

var states = {
  lexLeftBrace: function (lexer, done) {
    lexer.ignoreMany(' \n', function () {
      lexer.next(function (token) {
        if (token === "{") {
          lexer.emitToken('leftBrace');
          done(states.lexName);
        } else {
          throw new Error("Expected a left brace");
        }
      });
    });
  },
  lexRightBrace: function (lexer, done) {
    lexer.ignoreMany(' \n', function () {
      lexer.next(function (token) {
        if (token === "}") {
          lexer.emitToken('rightBrace');
          lexer.ignoreMany(' \n', function () {
            lexer.peek(function (token) {
              if (token === '}') {
                 done(states.lexRightBrace);
              } else if (token === ',') {
                done(states.lexComma);
              } else if (token === '') {
                return done('');
              } else {
                throw new Error("Invalid character: " + token);
              }
            });
          });
        } else {
          throw new Error("Expected a right brace");
        }
      });
    });
  },
  lexName: function (lexer, done) {
    lexy.ignoreUntil('"', function () {
      lexer.next(function () {
        lexer.ignore();
        lexy.acceptUntil('"', function () {
          lexer.emitToken('name');
          lexer.next(function () {
            lexer.ignore();
            done(states.lexColon);
          });
        });
      });
    });
  },
  lexColon: function (lexer, done) {
    lexer.ignoreMany(' \n', function () {
      lexer.next(function (token) {
        if (token === ":") {
          lexer.emitToken('colon');
          lexer.ignoreMany(' \n', function () {
            lexer.peek(function (token) {
              if (token === "{") {
                done(states.lexLeftBrace);
              } else if (token === '"' ) {
                done(states.lexString);
              } else {
                throw new Error("Invalid character: " + token);
              }
            });
          });
        } else {
          throw new Error("Expected a colon");
        }
      });
    });
  },
  lexString: function (lexer, done) {
    lexer.next(function (token) {
      lexer.ignore();
      lexy.acceptUntil('"', function () {
        lexer.emitToken('string');
        lexer.next(function (token) {
          lexer.ignore();
          lexer.ignoreMany(' \n', function () {
            lexer.peek(function (token) {
              if (token === "}") {
                done(states.lexRightBrace);
              } else if (token === ",") {
                done(states.lexComma);
              } else {
                throw new Error("Invalid character: " + token);
              }
            });
          });
        });
      });
    });
  },
  lexComma: function (lexer, done) {
    lexer.next(function (token) {
      lexer.emitToken('comma');
      done(states.lexName);
    })
  },
  initial: "lexLeftBrace"
}

// THE CALLS

var lexy = Lexer(states);
lexy.on('lexerToken', function (token) {
  console.log(token);
});
lexy.on('alldone', function () {
  console.log('DONE!');
});

//Set up a domain to catch error
var d = domain.create();
d.on("error", function (error) {
  console.log("ERROR: " + error.message);
});

d.run(function () {
  var fileStream = fs.createReadStream('file.txt');
  fileStream.pipe(lexy);
});

