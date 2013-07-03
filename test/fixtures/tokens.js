//These "states" will never alter the internal buffer of characters, but will keep the lexer running.
exports.noChangeStates = {
  dummy: function (lexer, done) {
    lexer.next(function (token) {
      if(token) {
        done(exports.noChangeStates.dummy);
      } else {
        done(false);
      }
    });
  },
  initial: 'dummy'
};