# Lexy, the extensible lexer base

Lexy is everything you need to build your own lexer in node. It contains the building blocks for the state machine. 

Just add states!

## The parts

A lexer is essentially a state machine. In this lexer, all states are functions. Each function runs, and then passes the next function that shoud be run back to lexy. 

You need to pass an object containing states to the lexer when it is instantiated. 

```javascript
var Lexer = require('../lexer').Lexer;

var states = {
	stateA: function (lexer, done) {
		lexer.next(function (char) {
			//Do some stuff
			done(stateB);
		});
  	},
  	stateB: function (lexer, done) {
		lexer.next(function (char) {
			//Do some stuff
			(char === '') ? done(false) : done(stateA);
		});
 	},
  	initial: "stateA" //The state the lexer will start with
}

var lexy = Lexer(states);
```

### EOF

When the lexer reaches the end of the input, next will return an empty string. This means that the string being lexed is terminated.

### Internals

The lexer maintains an internal buffer of characters and a pointer to the current character we are on. 

The pointer is manipulated with methods.

### Methods

Your states have methods available to them to do the heavy lifting. They act on the buffer, which logically contains (or will contain) the part of the incoming stream that has not been lexed yet. 

**emitToken(tokenType)**

Takes the characters between the beginning of the buffer and the pointer. Emits a token with the substring as the value, and removes the characters from the beginning of the internal array. 

**next(callback)**

Calls the callback function with the character at the current position and advances the internal pointer to the next character.

**backUp()**

Moves the internal pointer back one position. 

**ignore()**

Like emitToken, but does not emit a token. Still discards characters between start of string and pointer.

**rewind()**

Moves pointer to the first character in the inernal buffer

**peek(callback)**

Calls the callback function with the character at the current position.

**acceptMany(set, callback)**

Set is a string of characters. This function will advance the pointer until it's pointing to a character that is not in the set. 

**acceptUntil(set, callback)**

Set is a string of characters. This function will advance the pointer until it's pointing to a character that is in the set.

**ignoreMany(set, callback)**

Will remove the longest possible string composed of the characters in "set" from the beginning of the internal buffer.

**ignoreUntil(set, callback)**

Will remove characters from the beginning of the internal buffer until it hits a string that is in set. 

## Collecting output

You will need to bind to the '**lexerToken**' and '**allDone**' events.

```javascript
var lexy = Lexer(states);
lexy.on('lexerToken', function (token) {
  	console.log(token);
});
lexy.on('alldone', function () {
  	console.log('DONE!');
});
```

## Example

The example directory has a working example of lexing a *SUBSET* of JSON. 