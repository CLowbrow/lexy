//These states will never alter the internal buffer of characters, but will keep the lexer running.
exports.noChangeStates = {
  dummy: function (lexer, done) {
    lexer.next(function () {
      done(exports.noChangeStates.dummy);
    });
  },
  initial: 'dummy'
};